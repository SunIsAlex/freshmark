#!/bin/sh

set -eu
umask 022

repository=${FRESHMARK_REPOSITORY:-/opt/freshmark}
release_root=${FRESHMARK_RELEASE_ROOT:-/var/www/freshmark}
remote=${FRESHMARK_GIT_REMOTE:-origin}
branch=${FRESHMARK_GIT_BRANCH:-vps}
keep_releases=${FRESHMARK_KEEP_RELEASES:-3}
build_env_file=${FRESHMARK_BUILD_ENV_FILE:-/etc/freshmark-build.env}
api_service=${FRESHMARK_API_SERVICE:-freshmark-api.service}
api_health_url=${FRESHMARK_API_HEALTH_URL:-http://127.0.0.1:8790/api/health}
lock_file=${FRESHMARK_DEPLOY_LOCK:-/run/lock/freshmark-deploy.lock}
npm_cache_dir=${FRESHMARK_NPM_CACHE_DIR:-/var/cache/freshmark-npm}

force=false
restart_api=true
mode=deploy
rollback_release=
stage=
pending_link=

usage() {
  cat <<'EOF'
Usage:
  deploy.sh [--force] [--no-api-restart]
  deploy.sh --rollback [RELEASE] [--no-api-restart]

Environment overrides:
  FRESHMARK_REPOSITORY       Git checkout used as the deployment source
  FRESHMARK_RELEASE_ROOT     Directory containing releases/ and current
  FRESHMARK_GIT_REMOTE       Git remote to fetch (default: origin)
  FRESHMARK_GIT_BRANCH       Branch to deploy (default: vps)
  FRESHMARK_KEEP_RELEASES    Number of complete releases to retain (default: 3)
  FRESHMARK_BUILD_ENV_FILE   Root-readable build environment file
  FRESHMARK_API_SERVICE      systemd API unit
  FRESHMARK_NPM_CACHE_DIR    Writable npm cache outside root's home directory
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --force)
      force=true
      ;;
    --no-api-restart)
      restart_api=false
      ;;
    --rollback)
      mode=rollback
      if [ "$#" -gt 1 ] && [ "${2#--}" = "$2" ]; then
        rollback_release=$2
        shift
      fi
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

if [ "$(id -u)" -ne 0 ]; then
  echo "This deployment script must run as root." >&2
  exit 1
fi

case "$repository" in
  /*) ;;
  *) echo "FRESHMARK_REPOSITORY must be an absolute path." >&2; exit 1 ;;
esac
case "$release_root" in
  /|/var|/var/www) echo "Refusing unsafe FRESHMARK_RELEASE_ROOT: $release_root" >&2; exit 1 ;;
  /*) ;;
  *) echo "FRESHMARK_RELEASE_ROOT must be an absolute path." >&2; exit 1 ;;
esac
case "$npm_cache_dir" in
  /|/var|/var/cache) echo "Refusing unsafe FRESHMARK_NPM_CACHE_DIR: $npm_cache_dir" >&2; exit 1 ;;
  /*) ;;
  *) echo "FRESHMARK_NPM_CACHE_DIR must be an absolute path." >&2; exit 1 ;;
esac
case "$keep_releases" in
  ''|*[!0-9]*) echo "FRESHMARK_KEEP_RELEASES must be a positive integer." >&2; exit 1 ;;
esac
if [ "$keep_releases" -lt 2 ]; then
  echo "FRESHMARK_KEEP_RELEASES must be at least 2 to permit rollback." >&2
  exit 1
fi

for command in git npm node tar curl flock systemctl find awk sort mktemp; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Required command is missing: $command" >&2
    exit 1
  fi
done
if [ ! -d "$repository/.git" ]; then
  echo "Freshmark Git checkout not found at $repository" >&2
  exit 1
fi

releases_dir=$release_root/releases
current_link=$release_root/current
image_cache=$release_root/build-cache/images
mkdir -p "$releases_dir" "$image_cache" "$npm_cache_dir" "$(dirname "$lock_file")"
chmod 0700 "$npm_cache_dir"

exec 9>"$lock_file"
if ! flock -n 9; then
  echo "Another Freshmark deployment is already running." >&2
  exit 1
fi

cleanup() {
  if [ -n "$pending_link" ] && [ -L "$pending_link" ]; then
    rm -f -- "$pending_link"
  fi
  if [ -n "$stage" ] && [ -d "$stage" ]; then
    case "$stage" in
      "$releases_dir"/.stage-*) rm -rf -- "$stage" ;;
      *) echo "Refusing to clean unexpected staging directory: $stage" >&2 ;;
    esac
  fi
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM

release_is_valid() {
  candidate=$1
  [ -d "$candidate" ] \
    && [ -f "$candidate/public/index.html" ] \
    && [ -f "$candidate/public/version.json" ] \
    && [ -n "$(ls -d "$candidate"/public/assets/app.*.js 2>/dev/null)" ] \
    && [ -f "$candidate/server/server.mjs" ] \
    && [ -f "$candidate/.freshmark-release" ]
}

release_name_is_valid() {
  case "$1" in
    20??????T??????Z-[0-9a-f]*)
      suffix=${1#*-}
      case "$suffix" in
        ''|*[!0-9a-f]*) return 1 ;;
        *) return 0 ;;
      esac
      ;;
    *) return 1 ;;
  esac
}

set_current_release() {
  release_name=$1
  if ! release_name_is_valid "$release_name"; then
    echo "Invalid release name: $release_name" >&2
    return 1
  fi
  target=$releases_dir/$release_name
  if ! release_is_valid "$target"; then
    echo "Release is incomplete: $target" >&2
    return 1
  fi
  pending_link=$release_root/.current-next-$$
  rm -f -- "$pending_link"
  ln -s "releases/$release_name" "$pending_link"
  mv -Tf -- "$pending_link" "$current_link"
  pending_link=
}

wait_for_api() {
  attempt=0
  while [ "$attempt" -lt 20 ]; do
    if curl --noproxy '*' --fail --silent "$api_health_url" >/dev/null; then
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 1
  done
  return 1
}

activate_release() {
  release_name=$1
  previous_name=
  if [ -L "$current_link" ]; then
    previous_name=$(basename "$(readlink -f "$current_link")")
  fi

  set_current_release "$release_name"
  if [ "$restart_api" = false ]; then
    return 0
  fi

  if systemctl restart "$api_service" && wait_for_api; then
    return 0
  fi

  echo "API health check failed; restoring the previous release." >&2
  if [ -n "$previous_name" ] && release_is_valid "$releases_dir/$previous_name"; then
    set_current_release "$previous_name"
    systemctl restart "$api_service" || true
    wait_for_api || true
  else
    rm -f -- "$current_link"
  fi
  return 1
}

current_release_name() {
  if [ -L "$current_link" ]; then
    basename "$(readlink -f "$current_link")"
  fi
}

previous_release_name() {
  active=$(current_release_name)
  find "$releases_dir" -mindepth 1 -maxdepth 1 -type d -name '20??????T??????Z-*' -printf '%T@ %f\n' \
    | sort -nr \
    | awk -v active="$active" '$2 != active { print $2; exit }'
}

prune_releases() {
  active=$(current_release_name)
  find "$releases_dir" -mindepth 1 -maxdepth 1 -type d -name '20??????T??????Z-*' -printf '%T@ %f\n' \
    | sort -nr \
    | awk '{ print $2 }' \
    | {
        count=0
        while IFS= read -r release_name; do
          count=$((count + 1))
          if [ "$count" -le "$keep_releases" ] || [ "$release_name" = "$active" ]; then
            continue
          fi
          candidate=$releases_dir/$release_name
          if release_name_is_valid "$release_name"; then
            rm -rf -- "$candidate"
          else
            echo "Skipping unexpected release directory: $candidate" >&2
          fi
        done
      }
}

if [ "$mode" = rollback ]; then
  if [ -z "$rollback_release" ]; then
    rollback_release=$(previous_release_name)
  fi
  if [ -z "$rollback_release" ]; then
    echo "No previous Freshmark release is available." >&2
    exit 1
  fi
  activate_release "$rollback_release"
  echo "Freshmark rolled back to $rollback_release"
  exit 0
fi

git -C "$repository" fetch "$remote" "$branch"
if ! git -C "$repository" diff --quiet || ! git -C "$repository" diff --cached --quiet; then
  echo "Tracked changes exist in $repository; refusing to update the deployment checkout." >&2
  exit 1
fi
git -C "$repository" checkout "$branch"
git -C "$repository" merge --ff-only "$remote/$branch"

revision=$(git -C "$repository" rev-parse HEAD)
active_name=$(current_release_name)
active_revision=
if [ -n "$active_name" ] && [ -f "$current_link/.freshmark-release" ]; then
  active_revision=$(sed -n '1p' "$current_link/.freshmark-release")
fi
if [ "$force" = false ] && [ "$active_revision" = "$revision" ]; then
  echo "Freshmark $revision is already active. Use --force to rebuild it."
  exit 0
fi

release_id=$(date -u +%Y%m%dT%H%M%SZ)-$(printf '%s' "$revision" | cut -c1-12)
final_release=$releases_dir/$release_id
if [ -e "$final_release" ]; then
  echo "Release already exists: $final_release" >&2
  exit 1
fi
stage=$(mktemp -d "$releases_dir/.stage-$release_id-XXXXXX")
chmod 0755 "$stage"

git -C "$repository" archive "$revision" | tar -x -C "$stage"

if [ -f "$build_env_file" ]; then
  set -a
  # The file is root-controlled and contains shell-style KEY=value entries.
  . "$build_env_file"
  set +a
fi
: "${FRESHMARK_BASE_URL:=https://freshmark.sunisalex.org}"
: "${FRESHMARK_NETLIFY_FUNCTIONS:=true}"
: "${FRESHMARK_COMMENTS:=true}"
: "${FRESHMARK_COMMENTS_AUTH:=true}"
export FRESHMARK_BASE_URL FRESHMARK_NETLIFY_FUNCTIONS FRESHMARK_COMMENTS FRESHMARK_COMMENTS_AUTH
export FRESHMARK_IMAGE_CACHE_DIR="$image_cache"
export NPM_CONFIG_CACHE="$npm_cache_dir"
export NPM_CONFIG_UPDATE_NOTIFIER=false

(
  cd "$stage"
  npm ci --include=dev
  npm run build
  node -e '
    const fs = require("node:fs");
    const appBundle = fs.readdirSync("public/assets").find((file) => /^app\.[a-f0-9]{12}\.js$/.test(file));
    if (!appBundle) throw new Error("Missing hashed app bundle in public/assets");
    const required = [
      "public/index.html",
      "public/en/index.html",
      "public/search-index.json",
      `public/assets/${appBundle}`,
      "public/version.json",
    ];
    for (const file of required) {
      if (!fs.statSync(file).isFile()) throw new Error(`Missing build output: ${file}`);
    }
    JSON.parse(fs.readFileSync("public/search-index.json", "utf8"));
    JSON.parse(fs.readFileSync("public/version.json", "utf8"));
  '
  npm prune --omit=dev
)

printf '%s\n' "$revision" >"$stage/.freshmark-release"
mv -- "$stage" "$final_release"
stage=

if ! activate_release "$release_id"; then
  case "$final_release" in
    "$releases_dir"/20??????T??????Z-[0-9a-f]*) rm -rf -- "$final_release" ;;
    *) echo "Refusing to remove failed release at unexpected path: $final_release" >&2 ;;
  esac
  exit 1
fi
prune_releases
echo "Freshmark deployed $revision as $release_id"
