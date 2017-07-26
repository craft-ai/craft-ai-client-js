#!/bin/bash

AVAILABLE_INCREMENTS=(major minor patch)
PACKAGE_JSON_FILE="./package.json"
CHANGELOG_MD_FILE="./CHANGELOG.md"
GH_ORG="craft-ai"
GH_REPO="craft-ai-client-js"

# Let's check if we have GNU sed or BSD sed
sed --help >/dev/null 2>&1
if [ $? -eq 0 ]; then
  # There is a '--help' option, it is GNU BSD
  NL="\\n"
else
  NL="\\
"
fi

set -e
# Any subsequent(*) commands which fail will cause the shell script to exit immediately

usage ()
{
  echo "usage: ./update_version.sh [--dry-run] $(join_by "|" "${AVAILABLE_INCREMENTS[@]}")"
}

array_contains ()
{
  local array="$1[@]"
  local seeking=$2
  local in=1
  for element in "${!array}"; do
    if [[ $element == $seeking ]]; then
      in=0
      break
    fi
  done
  echo $in
}

function join_by { local IFS="$1"; shift; echo "$*"; }

apply=1
increment=""

while [ "$1" != "" ]; do
  case $1 in
    --dry-run )   apply=0
                  ;;
    * )           if [ $(array_contains AVAILABLE_INCREMENTS $1) == 1 ]; then
                    echo "Invalid increment: $1"
                    usage
                    exit 1
                  elif [ -n "$increment" ]; then
                    echo "Only one increment can be provided"
                    usage
                    exit 1
                  else
                    increment=$1
                  fi
                  ;;
  esac
  shift
done

if [ -z $increment ]; then
  usage
  exit 1
fi

# Make sure we are at the root directory of the repository
cd ${BASH_SOURCE%/*}/..

current_version=$(sed -n "s/^  \"version\": \"\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\)\",$/\1/p" $PACKAGE_JSON_FILE)
IFS='.' read -r -a current_version_array <<< "$current_version"
unset IFS

current_major=${current_version_array[0]}
current_minor=${current_version_array[1]}
current_patch=${current_version_array[2]}

case $increment in
  major)
    next_major=$((current_major+1))
    next_minor=0
    next_patch=0
    ;;
  minor)
    next_major=$current_major
    next_minor=$((current_minor+1))
    next_patch=0
    ;;
  patch)
    next_major=$current_major
    next_minor=$current_minor
    next_patch=$((current_patch+1))
    ;;
esac

echo "Increment version from v$current_major.$current_minor.$current_patch to v$next_major.$next_minor.$next_patch"

TODAY=`date +%Y-%m-%d`

commands=(
  "sed -i.bak 's/\"version\": \"$current_major.$current_minor.$current_patch/\"version\": \"$next_major.$next_minor.$next_patch/g' $PACKAGE_JSON_FILE"
  "sed -i.bak 's/.*[[Unreleased]].*/## [Unreleased](https:\/\/github.com\/$GH_ORG\/$GH_REPO\/compare\/v$next_major.$next_minor.$next_patch...HEAD) ##$NL$NL## [$next_major.$next_minor.$next_patch](https:\/\/github.com\/$GH_ORG\/$GH_REPO\/compare\/v$current_major.$current_minor.$current_patch...v$next_major.$next_minor.$next_patch) - $TODAY ##/g' $CHANGELOG_MD_FILE"
  "git add $PACKAGE_JSON_FILE $CHANGELOG_MD_FILE"
  "git commit --quiet -m 'Bumping from v$current_major.$current_minor.$current_patch to v$next_major.$next_minor.$next_patch'"
  "git tag -a v$next_major.$next_minor.$next_patch -m v$next_major.$next_minor.$next_patch")

if [ $apply == 0 ]; then
  echo "--- THIS IS A DRY RUN ---"
  echo "The following commands will be executed"
  for command in "${commands[@]}"; do
    echo "> $command"
  done
else
  for command in "${commands[@]}"; do
    eval $command
  done
fi
