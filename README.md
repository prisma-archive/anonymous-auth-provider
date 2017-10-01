# Graphcool developer notes

[![Greenkeeper badge](https://badges.greenkeeper.io/graphcool/anonymous-auth-provider.svg?token=b14296f344ae05fa962198fb7ece38b5fdd6d6388ff9769c4017a817c28fa2cc&ts=1506884285735)](https://greenkeeper.io/)

install serverless cli. Copy .envrc from 1pw.

Deploy with

```
serverless deploy

Or just the function (faster):

serverless deploy function --function authenticateAnonymousUser
```

Url: `https://162yijip11.execute-api.eu-west-1.amazonaws.com/dev/anonymous-auth-provider/authenticateAnonymousUser`

body:

```
{
	"context": {
		"graphcool": {
          "projectId": "cj05j5mg3069w0184tvl9emf5",
			"systemUrl": "https://api.graph.cool/system",
			"simpleUrl": "https://api.graph.cool/simple/v1/cj05j5mg3069w0184tvl9emf5",
			"pat": "some-pat-for-project"
		},
		"package": {
			"typeName": "User"
		}
	},
	"input": {
		"secret": "some-secret"
	}
}
```

# anonymous-auth-provider

## Package

```yml
name: anonymous-auth-provider
functions:
  authenticateAnonymousUser:
    schema: >
      interface input {
        secret: String!
      }
      interface output {
        token: String!
        id: String!
      }
    type: webhook
    url: https://162yijip11.execute-api.eu-west-1.amazonaws.com/dev/anonymous-auth-provider/authenticateAnonymousUser
interfaces:
  AnonymousUser:I'm up for anything
    schema: >
      interface AnonymousUser {
        secret: String @isUnique
        isVerified: Boolean! @defaultValue(value: false) @migrationValue(value: false)
      }
# This is configured by user when installing
install:
  - type: mutation
    binding: functions.authenticateAnonymousUser
    name: authenticateAnonymous${typeName}
    onType: ${typeName}
  - type: interface
    binding: interfaces.AnonymousUser
    onType: ${typeName}
```

## Features

 > note that `User` below is replaced with the typeName provided when configuring this package

### Interfaces

```graphql
interface AnonymousUser {
  secret: String
  isVerified: Boolean!
}
```

### Mutations

```graphql
authenticateAnonymousUser(secret: String!): authenticateAnonymousUserPayload

type authenticateAnonymousUserPayload {
  token: String!
}
```

## Installation

### Setup in Graphcool

Perform the following mutation in the system api

```graphql
mutation {
	installPackageV1()
}
```

dm @sorenbs in slack to have this activated. Include the following meta information:

 - ProjectId
 - Name of user model. Often this is `User`
 - facebook app id.
 
## Permissions

You should remove all Create User permissions. This ensures that users cannot be created manually and the `facebook-auth-provider` package will be able to create users anyway.

## Authentication flow in app

1. The user clicks authenticate with Facebook
2. Your app loads the Facebook ui to authenticate
3. Your app receives a Facebook Access Token
4. Your app calls the Graphcool mutation authenticateFacebookUser(fbToken: String!): {token: String!}
5. If the user doesn’t exist a new User will be created
6. Graphcool returns a valid token for the user
7. Your app stores the token and uses this for all further requests to Graphcool

## Merging accounts

> note: this is not supported yet

This package supports merging users created with different Auth Providers as long as the email mataches.

Here is a typical example:

1. A user signs up with the email/password based simple-auth-provider
2. The user verifies her email
3. At some later point the user signs in using Facebook

At this point `facebook-auth-provider` will try to merge the two accounts. Merging succeeds if:

 - The users primary email in Facebook matches the email stored in Graphcool
 - The user in Graphcool has verified the email.
 
Account merging is supported by all official Authentication Providers:

 - `facebook-auth-provider`
 - `google-auth-provider`
 - `simple-auth-provider`
 - `auth0-auth-provider`

Merging accounts with different emails is currently not supported

## Resources

See the official facebook documentation https://developers.facebook.com/docs/facebook-login
