"use strict";

const System = require('./system')
const Simple = require('./simple')

function handler(input, context) {
	console.log("start handler")

	const system = new System(context.graphcool.systemUrl, context.graphcool.pat)
	const simple = new Simple(context.graphcool.simpleUrl, context.graphcool.pat)

	const typeName = context.package.onType



	const graphcoolIdPromise = simple.client.query(`
		query {
			${typeName}(secret:"${input.secret}"){
		    id
		  }
		}`)
	.then(result => {
		console.log(result)

		if (result[typeName] === null) {
			return simple.client.query(`
				mutation {
					create${typeName}(
						secret: "${input.secret}"
						isVerified: false
					){
				    id
				  }
				}`)
			.then(result => {
				console.log(result)
				return result[`create${typeName}`].id
			})
		} else {
			return result[typeName].id
		}
	})
	

	// Get token for user

	const graphcoolTokenPromise = graphcoolIdPromise.then((graphcoolId) => {
		return system.generateUserToken(
			context.graphcool.projectId,
			graphcoolId,
			context.package.onType
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

	try {
		return handler(input, context)
		.then(res => {
			console.log("result:" + res)
			callback(null, mapResponse({token: res}))
		})
		.catch(err => {
			console.log("error: " + err)
			callback(null, mapResponse({_error: err}))
		})
	} catch (e) {
		console.log(e)
	}
}