const express = require('express');

const app = express();

const bodyParser = require('body-parser');
const request = require('request-promise')
const cheerio = require('cheerio')
const NodeCache = require( "node-cache" );
const url = require('url');

const myCache = new NodeCache();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

const findMoveinMoveList = (moveId, moveList) => {
    for (let move of moveList) {
        if(move.id.toLowerCase() === moveId.toLowerCase())
        {
            return { id: move.id, title: move.title, sequence: move.sequence };
        }
    }
    return "Requested Move Doesnt Exist"
}

const findNextMove = (moveId,moveList,path) => {
    let move = findMoveinMoveList(moveId, moveList);
    let moves = move.sequence.toLowerCase().split(" ").filter(function (e) {
        return e.length > 1;
    });
    console.log(moves)
    return moves[moves.indexOf(path[path.length - 1].toLowerCase()) + 1]
}

app.get('/', (req, res, next) => {

    if(myCache.has('moveList')){
        res.send(myCache.get('moveList'))
   }else{
          
        request("https://www.chessgames.com/chessecohelp.html", (error, response, html) => {
        if(!error && response.statusCode==200) {
            const $= cheerio.load(html);
            const listItems = $("tr");
            const moves = [];
            listItems.each((idx, el) => {
            const move = { id: "", title: "", sequence:"" };
              const font = $(el).find("td")
              font.each((index, td) => {
                if(index === 0)
                {
                    move.id = $(td).children("font").text()
                }
                else{
                    move.title = $(td).children("font").children("b").text()
                    move.sequence = $(td).children("font").children("font").text()
                }
              })
              moves.push(move)
            });
            myCache.set('moveList', moves, 180)
            res.send(moves);
        }
        else
        {
            res.send("Couldn't connect to the Scrapping Database")
        }
    });
   }

    
})>



app.get('/:moveId', function (req, res) {

    if(myCache.has('moveList')){
        res.send(findMoveinMoveList(req.params.moveId, myCache.get('moveList')))
    }else{
          
        request("https://www.chessgames.com/chessecohelp.html", (error, response, html) => {
        if(!error && response.statusCode==200) {
            const $= cheerio.load(html);
            const listItems = $("tr");
            const moves = [];
            listItems.each((idx, el) => {
            const move = { id: "", title: "", sequence:"" };
              const font = $(el).find("td")
              font.each((index, td) => {
                if(index === 0)
                {
                    move.id = $(td).children("font").text()
                }
                else{
                    move.title = $(td).children("font").children("b").text()
                    move.sequence = $(td).children("font").children("font").text()
                }
              })
              moves.push(move)
            });
            myCache.set('moveList', moves, 180)
            res.send(findMoveinMoveList(req.params.moveId, moves))

        }
    });
   }
})

app.get('/:moveId/*', function (req, res) {

    var path = url.parse(req.url).pathname;

    // split and remove empty element;
    path = path.split('/').filter(function (e) {
        return e.length > 0;
    });

    // remove the first component 'callmethod'
    path = path.slice(1);

    console.log(path)

    if(myCache.has('moveList')){
        res.send(findNextMove(req.params.moveId, myCache.get('moveList'),path))
    }else{
          
        request("https://www.chessgames.com/chessecohelp.html", (error, response, html) => {
        if(!error && response.statusCode==200) {
            const $= cheerio.load(html);
            const listItems = $("tr");
            const moves = [];
            listItems.each((idx, el) => {
            const move = { id: "", title: "", sequence:"" };
              const font = $(el).find("td")
              font.each((index, td) => {
                if(index === 0)
                {
                    move.id = $(td).children("font").text()
                }
                else{
                    move.title = $(td).children("font").children("b").text()
                    move.sequence = $(td).children("font").children("font").text()
                }
              })
              moves.push(move)
            });
            myCache.set('moveList', moves, 180)
            res.send(findNextMove(req.params.moveId, moves,path))

        }
    });
   }
})


const PORT = process.env.PORT ||5000;
 
app.listen(PORT, console.log(
  `Server started on port ${PORT}`));
