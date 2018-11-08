const express = require('express')
const app = express()
var crypto = require('crypto')

var prevResponse = undefined

var responses = {}
var queryresp = [
  { query: "Hello there.", resp: "Hi, how are you?" },
  { query: "I am fine, how are you?", resp: "That is great to hear." }
]

for ( qr of queryresp ) {
  responses[crypto.createHash('md5').update(qr.query).digest('hex')] = qr.resp
}

function getRandomQuery() {
	var index = Math.floor(queryresp.length * Math.random())
	var query = queryresp[index].query
	var hash = crypto.createHash('md5').update(query).digest('hex')
	var count = 0

	while (hash in responses && count < 10) {
		index = Math.floor(queryresp.length * Math.random())
		query = queryresp[index].query
		hash = crypto.createHash('md5').update(query).digest('hex')
		count += 1
	}
	return query
	
	
}

app.get('/chat', (req, res) => {
	
	var cq = req.query.chat
	var hash = crypto.createHash('md5').update(cq).digest('hex')
	if (prevResponse !== undefined) {
		var prevHash = crypto.createHash('md5').update(prevResponse).digest('hex')
		if (responses[prevHash] === undefined) { 
			for (qr of queryresp){
				if (qr.query == prevResponse) {
					qr.resp = cq
				}
			}
			responses[prevHash] = cq
		}
	}
	if (hash in responses) {
		if (responses[hash] !== undefined){
			prevResponse = responses[hash]
		} else {	
			prevResponse = getRandomQuery()
		}
	} else {
		queryresp.push({query: cq, resp: undefined})
		responses[hash] = undefined
		prevResponse = getRandomQuery()
	}

	res.send(prevResponse)

})

app.use(express.static('public'))

app.listen(3000, "0.0.0.0", () => console.log('Example app listening on port 3000!'))
