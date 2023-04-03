SCRIPT_DIR=$( cd -- "$( dirname -- "$0" )" &> /dev/null && pwd )
# Facilitate redefining NODE in terms of SCRIPT_DIR via a regex.
NODE=node

if [ ! -x "$(command -v $NODE)" ]; then
  # shellcheck disable=SC2016
  echo 'ERROR: `node` is required to run Graphite Interactive, but it was not'
  # shellcheck disable=SC2016
  echo 'found on the $PATH. For information on installing Node.js, see:'
  echo 'https://nodejs.dev/en/learn/how-to-install-nodejs/'
  exit 1
fi

"$NODE" "$SCRIPT_DIR/apps/gti-server/dist/run-proxy.js" "$@"
