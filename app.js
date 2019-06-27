console.log("Hello World!");
const assert = require('assert');
const axios = require('axios');

class Node {
    constructor(parent, position) {
        this.parent = parent;
        this.position = position;

        this.g = 0;
        this.f = 0;
        this.h = 0;
    }

    equals(other) {
        return this.position.equals(other.position);
    }
}

class Point {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }

    equals(other) {
        return (
            this.x == other.x &&
            this.y == other.y
        );
    }

    relative(other) {
        // returns which direction I am relative to teh other point
        if (other.x > this.x) {
            return "N";
        }
        if (other.x < this.x) {
            return "S";
        }
        if (other.y > this.y) {
            return "W";
        }
        return "E";

    }
}

class Maze {
    constructor(map, goal, start) {
        this.map = map;
        this.goal = goal;
        this.start = start;
        console.log(map.length);
        console.log(map[0].length);
        console.log(map.map(e => e.join("")).join("\n"));
    }

    get length() {
        return this.map.length;
    }

    get width() {
        return this.map[0].length;
    }

    neighbors(node) {
        // returns the neighbours of a point on the map, as points
        let point = node.position;
        let points = [];
        if (point.x > 0) {
            if (this.map[point.x-1][point.y] !== "X")
                points.push(new Node(node, new Point(point.x-1, point.y)));
        }
        if (point.y > 0) {
            if (this.map[point.x][point.y-1] !== "X")
                points.push(new Node(node, new Point(point.x, point.y-1)));
        }
        if (point.y < this.width - 1) {
            if (this.map[point.x][point.y+1] !== "X")
               points.push(new Node(node, new Point(point.x, point.y+1)));
        }
        if (point.x < this.length - 1) {
            if (this.map[point.x+1][point.y] !== "X")
                points.push(new Node(node, new Point(point.x+1, point.y)));
        }
        return points;
    }
    
    f() {
        let childrenAdded = 0;
        const openList = [];
        const closedList = {};
        //const closedList = this.map.map(e => [...e].fill(0));
        
        openList.push(this.start);

        while (openList.length > 0) {
            let currentNode = openList[0];
            let currentIndex = 0;
            openList.forEach((node, index) => {
                if (node.f < currentNode.f) {
                    currentIndex = index;
                    currentNode = node;
                }
            })

            openList.splice(currentIndex,1);
            closedList[`${currentNode.position.x}-${currentNode.position.y}`] = 1;

            if (currentNode.equals(this.goal)) {
                let path = [];
                let current = currentNode;
                while (current != undefined) {
                    if (current.parent)
                        path.push(current.position.relative(current.parent.position));
                    current = current.parent;
                }
                return path.reverse().join("");
            }
            let children = this.neighbors(currentNode);
            for (let child of children) {
                if (closedList[`${child.position.x}-${child.position.y}`] == 1) {
                    continue;
                }

                child.g = currentNode.g + 1;
                child.h = Math.abs(currentNode.position.x-child.position.x) + Math.abs(currentNode.position.y - child.position.y);
                child.f = child.g + child.h;
                let exists = false;
                for (let node of openList) {
                    if (child.equals(node) && child.g >= node.g) {
                        // this is dumb
                        exists = true;
                        break;
                    }
                }
                if (exists) continue;
                openList.push(child);
            }

        }
        

    }

    backtrack() {

    }

    solve() {
        this.f()
        return this.backtrack();
    }
}


maze = [["A","","X","","B"],
        ["","","","",""],
        ["","","","",""]];

goal = new Node(undefined, new Point(0,4));
start = new Node(undefined, new Point(0,0));

m = new Maze(maze,goal, start);

console.log(m.goal.y);
assert(m.length === 3, "Length is not 3");
assert(m.width === 5, "Width is not 5");
let n1 = new Node(undefined, new Point(1,1));
let n2 = new Node(undefined, new Point(1,1));
assert(n1.equals(n2), "M is not equal to n");
sol = [[4, 3, 2, 1, 0],
       [5, 4, 3, 2, 1],
       [6, 5, 4, 3, 2]];  
console.log(m.f(), "SOLUTION");

let j =  {
  "name": "Maze #236 (10x10)",
  "mazePath": "/mazebot/mazes/ikTcNQMwKhux3bWjV3SSYKfyaVHcL0FXsvbwVGk5ns8",
  "startingPosition": [ 4, 3 ],
  "endingPosition": [ 3, 6 ],
  "message": "When you have figured out the solution, post it back to this url. See the exampleSolution for more information.",
  "exampleSolution": { "directions": "ENWNNENWNNS" },
  "map": [
    [ " ", " ", "X", " ", " ", " ", "X", " ", "X", "X" ],
    [ " ", "X", " ", " ", " ", " ", " ", " ", " ", " " ],
    [ " ", "X", " ", "X", "X", "X", "X", "X", "X", " " ],
    [ " ", "X", " ", " ", "A", " ", " ", " ", "X", " " ],
    [ " ", "X", "X", "X", "X", "X", "X", "X", " ", " " ],
    [ "X", " ", " ", " ", "X", " ", " ", " ", "X", " " ],
    [ " ", " ", "X", "B", "X", " ", "X", " ", "X", " " ],
    [ " ", " ", "X", " ", "X", " ", "X", " ", " ", " " ],
    [ "X", " ", "X", "X", "X", "X", "X", " ", "X", "X" ],
    [ "X", " ", " ", " ", " ", " ", " ", " ", "X", "X" ]
  ]
}

function solve(j) {
    start = new Node(undefined, new Point(j.startingPosition[1], j.startingPosition[0]));
    goal = new Node(undefined, new Point(j.endingPosition[1], j.endingPosition[0]));
    maze = j.map;
    theMaze = new Maze(maze, goal, start);
    let sol = theMaze.f();
    return sol;
}

solve(j);
async function go() {
let login = await axios.post("https://api.noopschallenge.com/mazebot/race/start",
    {login: "mattschlosser"}, 
    {headers: {"content-type" : "application/json"}});
while (login.data.nextMaze) {
    try {
    let map = await axios.get("https://api.noopschallenge.com" + login.data.nextMaze);
    let sol = solve(map.data);
    console.log(sol);
    login = await axios.post("https://api.noopschallenge.com" + map.data.mazePath,
        {"directions": sol},
        {headers: {"content-type" : "application/json"}});
    } catch (error) {
        console.log(error);
    }
}
console.log(login.data);
}
go();




