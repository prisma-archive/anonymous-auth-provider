"use strict";

const System = require('./system')
const Simple = require('./simple')
const Facebook = require('./facebook')

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

module.exports.lambda = function(event, lambdaContext, callback) {

	const body = JSON.parse(event.body)
	const input = body.input
	const context = body.context

	console.log(input)
	console.log(context)

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

