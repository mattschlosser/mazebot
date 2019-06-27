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
        // returns which direction I am relative to the other point
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
        const openList = [];
        const closedList = {};
        
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
}


maze = [["A","","X","","B"],
        ["","","","",""],
        ["","","","",""]];

goal = new Node(undefined, new Point(0,4));
start = new Node(undefined, new Point(0,0));

m = new Maze(maze,goal, start);


// some tests
assert(m.length === 3, "Length is not 3");
assert(m.width === 5, "Width is not 5");
let n1 = new Node(undefined, new Point(1,1));
let n2 = new Node(undefined, new Point(1,1));
assert(n1.equals(n2), "M is not equal to n");
assert(m.f() == "ESEENE", "Map solution is wrong");


function solve(j) {
    start = new Node(undefined, new Point(j.startingPosition[1], j.startingPosition[0]));
    goal = new Node(undefined, new Point(j.endingPosition[1], j.endingPosition[0]));
    maze = j.map;
    theMaze = new Maze(maze, goal, start);
    let sol = theMaze.f();
    return sol;
}

async function go() {
    console.log("Get ready");
    let login = await axios.post("https://api.noopschallenge.com/mazebot/race/start",
                    {login: "mattschlosser"}, 
                    {headers: {"content-type" : "application/json"}});
    console.log("Go");
    let mapsSolved = 0;
    while (login.data.nextMaze) {
        try {
            let map = await axios.get("https://api.noopschallenge.com" + login.data.nextMaze);
            let sol = solve(map.data);
            login = await axios.post("https://api.noopschallenge.com" + map.data.mazePath,
                {"directions": sol},
                {headers: {"content-type" : "application/json"}});
            console.log("Maps solved: ", ++mapsSolved);
        } catch (error) {
            console.log(error);
        }
    }
    console.log(login.data);
}

go();