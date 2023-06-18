# PromptInspector

PromptInspector is a discord bot based off of [sALTaccount/PromptInspectorBot](https://github.com/sALTaccount/PromptInspectorBot) but in JavaScript.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Introduction

PromptInspector is a Discord bot designed to assist Discord users by extracting metadata from Stable Diffusion images, and then sending that data in a Discord DM to the user. (See Example Pictures)

## Features

- Automatic extraction of metadata from images
- Aesthetic Embed and Formatting
- Sending prompts directly to users via direct messages

## Installation

To install and set up the PromptInspector bot, follow these steps:

1. Clone the repository:

```shell
$ git clone https://github.com/your-username/PromptInspector.git
$ cd PromptInspector
```

2. Grab your bot token from the Developer portal, and put it in the .env file.
3. Run the bot:
```shell
$ npm i
$ node src/index.js
```

![Example](/src/images/embed.png)
