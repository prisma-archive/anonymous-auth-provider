"use strict";

const System = require('./system')
const Simple = require('./simple')
const Facebook = require('./facebook')

// MOCK DATA

const context = {
	graphcool: {
		systemUrl: "https://api.graph.cool/system",
		simpleUrl: "https://api.graph.cool/simple/v1/cj05j5mg3069w0184tvl9emf5",
		pat: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0ODkyNTM2NTAsImNsaWVudElkIjoiY2lubThhOHJuMDAwMmZpcWNvMDJkMWNlOSIsInByb2plY3RJZCI6ImNqMDVqNW1nMzA2OXcwMTg0dHZsOWVtZjUiLCJwZXJtYW5lbnRBdXRoVG9rZW5JZCI6ImNqMDVqNjZ6ajA2cXUwMTQ0aWV4a3p3cHUifQ.yOp0dcekPB-pG4hRM6mTBBpSKV3Ppq-6of4UvITetKE",
		projectId: "cj05j5mg3069w0184tvl9emf5"
	},
	package: {
		modelName: "User"
	}
}

const input = {
	fbToken: "EAADrUoRnyTkBADEJxWptYxc2KgWggYMYyNc9Leyis7abdWCH0XjSTjnBevppdxvx6WaSrLoLe82ainHXEcR8V9TWkOD6GBRJWS8NYZCLZCnqDh6I20sWBEUprhQp5MVNnw9TpTyJ56T6w9s3woy4bmOaPIodMZCDhrDPlBmBuyiZBS2SW9MD"
}

// FUNCTIONALITY

function handler(input, context) {
	console.log("start handler")

	const system = new System(context.graphcool.systemUrl, context.graphcool.pat)
	const simple = new Simple(context.graphcool.simpleUrl, context.graphcool.pat)
	const facebook = new Facebook(input.fbToken)

	// Get user id + email

	const fbUserPromise = facebook.me()

	// Make sure user exists in Graphcool

	const graphcoolIdPromise = fbUserPromise
	.then(fbUser => {
		console.log("fbUser: ", fbUser)

		return simple.client.query(`
			query {
				User(facebookUserId:"${fbUser.id}"){
			    id
			  }
			}`)
		.then(result => {
			console.log(result)

			if (result.User === null) {
				return simple.client.query(`
					mutation {
						createUser(
							facebookUserId:"${fbUser.id}",
							email: "${fbUser.email}"
							isVerified: true
						){
					    id
					  }
					}`)
				.then(result => {
					console.log(result)
					return result.createUser.id
				})
			} else {
				return result.User.id
			}
		})
	})

	// Get token for user

	const graphcoolTokenPromise = graphcoolIdPromise.then((graphcoolId) => {
		return system.generateUserToken(
			context.graphcool.projectId,
			graphcoolId,
			context.package.modelName
		).then((token) => {
			console.log("graphcool token: " + token)

			return token
		})
	})

	return graphcoolTokenPromise
}

function mapResponse(body) {
	return {
      statusCode: 200,
      body: JSON.stringify(body)
    }
}

// LAMBDA HANDLER

module.exports.lambda = function(event, lambdaContext, callback) {

	console.log(event)
	console.log(lambdaContext)


	return handler(input, context)
	.then(res => {
		callback(null, mapResponse({token: res}))
	})
}

// handler(input, context)
// .then(r => {
// 	console.log("DONE")
// 	console.log(r)
// })

