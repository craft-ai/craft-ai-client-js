# Developers instructions #

## Running the tests locally ##

1. Make sure you have a version of [Node.js](https://nodejs.org) installed (any version >0.12 should work).
1. Create a test **craft ai** project and retrieve its **write token**.
2. At the root of your local clone, create a file named `.env` with the following content

  ```
  CRAFT_TOKEN=<retrieved_token>
  ```

3. Install the dependencies.

  ```console
  $ npm install
  ```

4. Run the tests!

  ```console
  $ npm run test
  ```

5. Additionaly, you can run a test server to run the test in a browser at <http://localhost:8080/webpack-dev-server/>.

  ```console
  $ npm run dev_browser
  ```

## Releasing a new version (needs administrator rights) ##

1. Make sure the build of the master branch is passing.

  [![Build](https://img.shields.io/travis/craft-ai/craft-ai-client-js/master.svg?style=flat-square)](https://travis-ci.org/craft-ai/craft-ai-client-js)

2. Checkout the master branch locally.

  ```console
  $ git fetch
  $ git checkout master
  $ git reset --hard origin/master
  ```

3. Update `README.md` from **craft ai** documentation found
   at <https://beta.craft.ai/doc/js>.

  ```console
  $ npm run update_readme
  ```

  > This will create a git commit.

4. Increment the version in `package.json` and move _Unreleased_ section
   of `CHANGELOG.md` to a newly created section for this version.

  ```console
  $ ./scripts/update_version.sh patch
  ```

  `./scripts/update_version.sh minor` and `./scripts/update_version.sh major` are
  also available - see [semver](http://semver.org) for a guideline on when to
  use which.

  > This will create a git commit and a git tag.

5. Push everything.

  ```console
  $ git push origin master
  $ git push --tags
  ```

  > This will trigger the publishing of this new version to [npm](https://www.npmjs.com/package/craft-ai) by [travis](https://travis-ci.org/craft-ai/craft-ai-client-js).
