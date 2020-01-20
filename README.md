# A Hands-On Introduction to modern web based A&A

Authentication (openID) & Authorization (oAuth2)

Workshop is slides is published at [https://larskaare.github.io/WebAuthAuthorAndOtherCreatures/](https://larskaare.github.io/WebAuthAuthorAndOtherCreatures/). Slides are developed using [reveal.js]([reveal.js](https://revealjs.com))


# Workshop objectives

De-mystify, build confidence and prepare for further exploration of Authentication and Authorization.

* Give an introduction to basics modern web A&A
* Explore Spec and Azure Implementation
* Hands-on coding with a few A&A scenarios
* Insight into threats and current best practices (BCP) for security

# Workshop outline

* What problem are we trying to solve?
* Practicalities
* The basics of A&A
* Exercises (8+1)
  * Raw flows, add authentication to web app, using frameworks & libraries, accessing 3rd party api, refresh tokens, single page web app (SPA), protecting web api's
* Deploy application to the Cloud (using Radix)

# Pre-requisites
These are the pre-requisites that will make the workshop a whole lot more usefull.

## Roles

* Valid Equinor Software Developer On-Boarding
* Valid role "Application Developer (Azure Active Directory)"
* Optional for deploy to cloud exercise: Access to Radix Playground - role "Radix Playground Users"

## Skills
Helpful knowledge and skills:

* HTTP
* JavaScript/Node.js
* Linux command line
* (Docker)

## Software
Installed and verified to work software.

* Node.js
  * Use Node LTS version v12.4.1 (tested with v11.9.0 as well)
  * Using node version manager nvm is recommended
  * Python may be needed for some node modules to install
* Development IDE ( like VS Code)
* Git, account on github.com
* Postman
* Optional for deploy to cloud
  * Local Docker installation

# Verifying working environment

    $ git --version
Should produce proof of an up to date version of git (https://git-scm.com/downloads)

    $ node --version
Should produce proof of an up to date LTS version og NodeJS (https://nodejs.org/en/download/)

    $ npm --version
Npm is installed with NodeJS

    $ python --version
Should produce proof of a relevant 2.6 version of Python2 (like 2.7.16) (https://www.python.org/downloads/)

    $ docker --version
Should produce evidence of an update to date version of docker (https://www.docker.com/products/docker-desktop)