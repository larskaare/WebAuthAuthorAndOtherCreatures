# A Hands-On Introduction to modern web based A&A

<!-- TOC -->

- [A Hands-On Introduction to modern web based A&A](#a-hands-on-introduction-to-modern-web-based-aa)
  - [Workshop objectives](#workshop-objectives)
  - [Workshop outline](#workshop-outline)
  - [Pre-requisites](#pre-requisites)
    - [Roles](#roles)
    - [Skills](#skills)
    - [Software](#software)
    - [Consideration when using Windows](#consideration-when-using-windows)
      - [Shell](#shell)
      - [Known isues](#known-isues)
  - [Verifying working environment](#verifying-working-environment)
  - [Using docker-compose to provide the developer environment](#using-docker-compose-to-provide-the-developer-environment)
    - [Start](#start)
      - [_Session 1: Build and start the development container_](#session-1-build-and-start-the-development-container)
      - [_Session 2: Run commands inside the development container_](#session-2-run-commands-inside-the-development-container)
      - [_Session 3: Access the files in host_](#session-3-access-the-files-in-host)
    - [Stop](#stop)

<!-- /TOC -->

Workshop is slides is published at [https://larskaare.github.io/WebAuthAuthorAndOtherCreatures/](https://larskaare.github.io/WebAuthAuthorAndOtherCreatures/). Slides are developed using [reveal.js]([reveal.js](https://revealjs.com))

## Workshop objectives

De-mystify, build confidence and prepare for further exploration of Authentication and Authorization.

- Give an introduction to basics modern web A&A
- Explore Spec and Azure Implementation
- Hands-on coding with a few A&A scenarios
- Insight into threats and current best practices (BCP) for security

## Workshop outline

- What problem are we trying to solve?
- Practicalities
- The basics of A&A
- Exercises (8+1)
  - Raw flows, add authentication to web app, using frameworks & libraries, accessing 3rd party api, refresh tokens, single page web app (SPA), protecting web api's
- Deploy application to the Cloud (using Radix)

## Pre-requisites

These are the pre-requisites that will make the workshop a whole lot more usefull.

### Roles

- Valid Equinor Software Developer On-Boarding
- Valid role "Application Developer (Azure Active Directory)
- Optional for deploy to cloud exercise: Access to Radix Playground - role "Radix Playground Users"

### Skills

Helpful knowledge and skills:

- HTTP
- JavaScript/Node.js
- Linux command line
- (Docker)

### Software

Installed and verified to work software.

- Node.js
  - Use Node LTS version v12.16.3
  - Using node version manager [nvm](https://github.com/nvm-sh/nvm) is recommended on Linux/Mac. For Windows users [nvm-windows](https://github.com/coreybutler/nvm-windows) could be an option.
  - Python may be needed for some node modules to install
- Development IDE (like [Visual Studio Code](https://code.visualstudio.com/))
- Git, account on github.com
- [Postman](https://www.postman.com/downloads/)
- Optional for deploy to cloud
  - Local Docker installation

### Consideration when using Windows

#### Shell

Most things should work ok with the cmd or powershell - with a few limitations. I've tested with using git-bash which is part of [Git for Windows](https://gitforwindows.org/)

#### Known isues

- Be aware of how to export environment variables, `set` for Windows, `export` for Bash/Linux
- Define proxy variables if needed:
  
```shell
  HTTP_PROXY=http://url:port
  HTTPS_PROXY=http://url:port
```

- `npm` is a bit quicky when it comes to running scripts. Doing `npm start` may fail, but copying the command from `package.json` and running from the terminal works for most scenarios. Configuring NPM to use a different shell could be an option `npm config set shell-script` could be an option to explore.
- Using [Docker Desktop for Windows](https://www.docker.com/get-started) should work fine. Remeber to define proxy settings if your beind one of these. Update the `~/.docker/config.json` with something like this (update `url`and `port` to reflect your context):

```json
{"proxies":
  {
    "default":
      {
        "httpProxy": "http://url:port",
        "httpsProxy": "http://url:port",
        "noProxy": ""
      }
  }
}
```

## Verifying working environment

```shell
$ git --version
git version 2.24.3
```

Should produce proof of an up to date version of git [Git](https://git-scm.com/downloads)

```shell
$ node --version
v12.16.3
```

Should produce proof of an up to date LTS version of [NodeJS](https://nodejs.org/en/download/)

```shell
$ npm --version
6.14.4
```

Npm is installed with NodeJS

```shell
$ python --version
Python 2.7.16
```

Should produce proof of a relevant 2.7 version of [Python2](https://www.python.org/downloads)

```shell
$ docker --version
Docker version 19.03.8
```

Should produce evidence of an update to date version of docker [Docker](https://www.docker.com/products/docker-desktop)

> Please verify that the tools work properly within your network environment. Typical problems would be related to PROXY settings.

## Using docker-compose to provide the developer environment

The [`./docker-compose.yaml`](./docker-compose.yaml) contains everything we need to run a development environment.

### Start

You will want to use 2-3 terminal sessions ("tabs") for this as it is easier to see what is going on where.

#### _Session 1: Build and start the development container_

_Step 1_: Create the workshop config file for docker-compose  
Copy the template file `workshop-credentials.env-template` and rename the copy to `workshop-credentials.env`, then provide the missing values. (Verify that new .env this file is kept out of version control)

_Step 2_: Start the development container

```sh
docker-compose up --build
```

_Notes for windows users_:  

- If you are using WSL1:
  Start docker-compose in windows `cmd` as this will use the native windows docker client that will handle path translation for you.  
- If you are using WSL2  
  You are in a happy place, stay there.

#### _Session 2: Run commands inside the development container_  

```sh
# Open a bash session into the development container
docker exec -it workshop_development_container bash

# From inside the container you can then run any npm command.

# Example - Exercise 2
# First install all packages for exercise 2
cd ex-2
npm install
# Then start the nodejs application
npm start
```

#### _Session 3: Access the files in host_  

```sh
# Bring up your IDE and start hacking away.
# Please note that template files will not be hot reloaded, see "Notes" down below
code .

# Run git commands etc
git status
```

### Stop

Stop and remove all started containers and networks

```sh
docker-compose down
```

You can always bomb out using `ctrl+c` and similar in the session where `docker-compose` is running, the drawback is that there will be leftovers from the `docker-compose` process.  
By using command `docker-compose down` you will get a clean exit.  
Optionally you can provide even more arguments to specify what should be cleaned up for more advanced use cases.
