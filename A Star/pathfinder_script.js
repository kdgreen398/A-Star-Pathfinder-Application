var grid = document.getElementById("grid");
var node_array = [];
var brush_mode = "wall";
var start_node = null;
var end_node = null;

var blank_color = "#1982C4";
var start_color = "#63C132";
var end_color = "#FF595E";
var path_color = "#FFCA3A";
var wall_color = "black";

var isMouseDown = false;


function Node(row, column, element){
    this.row = row;
    this.column = column;
    this.element = element;
    this.state = "blank";

    this.distance_to_end = null;
    this.distance_from_start = null;
    this.f_cost = null;
    this.previous_node = null;
}

for(var i = 0; i < 25; i++){
    var node_row = []
    for (var j = 0; j < 50; j++){
        var node = document.createElement("div");
        node.className = "node";
        node.id = i+'-'+j;
        grid.appendChild(node);
        node_row.push(new Node(i, j, node));
    }
    node_array.push(node_row);
} 

function setMouseDown(){
    isMouseDown = true;
}

function setMouseUp(){
    isMouseDown = false;
}

$(".node").mousedown(function(){
    var pos = $(this).attr('id').split("-");
    var row = parseInt(pos[0], 10);
    var col = parseInt(pos[1], 10);

    
    if(brush_mode == "wall"){
        node_array[row][col].state = "wall";
        node_array[row][col].element.style.backgroundColor = wall_color;
    }
    else if(brush_mode == "start"){
        if (start_node != null){
            start_node.state = "blank";
            start_node.element.style.backgroundColor = blank_color;
        }
        start_node = node_array[row][col];
        start_node.state = "start";
        start_node.element.style.backgroundColor = start_color;
    }
    else if(brush_mode == "end"){
        if (end_node != null){
            end_node.state = "blank";
            end_node.element.style.backgroundColor = blank_color;
        }
        end_node = node_array[row][col];
        end_node.state = "end";
        end_node.element.style.backgroundColor = end_color;
    }

    liveUpdate();

    
    
});

$(".node").mouseenter(function(){
    var pos = $(this).attr('id').split("-");
    var row = parseInt(pos[0], 10);
    var col = parseInt(pos[1], 10);
    if(isMouseDown){
        if(brush_mode == "wall"){
            node_array[row][col].state = "wall";
            node_array[row][col].element.style.backgroundColor = wall_color;
            
            liveUpdate();
        }
    }
});

$(".node").hover(function(){
    var pos = $(this).attr('id').split("-");
    var row = parseInt(pos[0], 10);
    var col = parseInt(pos[1], 10);
    if(brush_mode == "wall"){
        node_array[row][col].element.style.backgroundColor = wall_color;
    }
    else if(brush_mode == "start"){
        node_array[row][col].element.style.backgroundColor = start_color;
    }
    else if(brush_mode == "end"){
        node_array[row][col].element.style.backgroundColor = end_color;
    }
},
function(){
    var pos = $(this).attr('id').split("-");
    var row = parseInt(pos[0], 10);
    var col = parseInt(pos[1], 10);

    if(node_array[row][col].state == "wall"){
        node_array[row][col].element.style.backgroundColor = wall_color;
    }
    else if(node_array[row][col].state == "start"){
        node_array[row][col].element.style.backgroundColor = start_color;
    }
    else if(node_array[row][col].state == "end"){
        node_array[row][col].element.style.backgroundColor = end_color;
    }
    else if(node_array[row][col].state == "path"){
        node_array[row][col].element.style.backgroundColor = path_color;
    }
    else{ 
        node_array[row][col].element.style.backgroundColor = blank_color;
    }
});

function changeMode(mode){
    brush_mode = mode;
}

function resetGrid(){
    document.getElementById("message").innerHTML = "A* Pathfinder";
    for(var i = 0; i < 25; i++){
        for(var j = 0; j < 50; j++){
            node_array[i][j].state = "blank";
            node_array[i][j].element.style.backgroundColor = blank_color;
            node_array[i][j].distance_from_start = null;
            node_array[i][j].distance_to_end = null;
            node_array[i][j].f_cost = null;
            node_array[i][j].previous_node = null;

            start_node = null;
            end_node = null;
        }
    }
}

function runAStar(){
    if (start_node == null || end_node == null)
        return;

    var open_list = [];
    var closed_list = [];

    open_list.push(start_node);
    var current_node = start_node;

    current_node.distance_from_start = 0;
    current_node.distance_to_end = Math.abs(current_node.row - end_node.row) + Math.abs(current_node.column - end_node.column);
    current_node.f_cost = current_node.distance_from_start + current_node.distance_to_end;

    while(current_node != end_node){
        getAdjNodes(current_node).forEach(function(item){
            if(!closed_list.includes(item) && !open_list.includes(item)){
                item.distance_from_start = current_node.distance_from_start + getDistance(item, current_node);
                item.distance_to_end = Math.abs(item.row - end_node.row) + Math.abs(item.column - end_node.column);

                if(item.f_cost == null){
                    item.f_cost = item.distance_from_start + item.distance_to_end;
                    item.previous_node = current_node;
                }
                else{
                    var newFCost = item.distance_from_start + item.distance_to_end;
                    if(newFCost < item.f_cost){
                        item.f_cost = newFCost;
                        item.previous_node = current_node;
                    }
                }

                open_list.push(item);
            }
        });

        open_list.splice(open_list.indexOf(current_node), 1);
        closed_list.push(current_node);

        if(open_list.length == 0)
            return;
            
        var lowest_f = open_list[0].f_cost;
        current_node = open_list[0];

        open_list.forEach(function(item) {
            if(item.f_cost < lowest_f){
                lowest_f = item.f_cost;
                current_node = item;
            }
        });
    }
    retracePath(current_node);
    hasBeenRun = true;
}

function getDistance(obj_1, obj_2){
    var a = Math.abs(obj_1.row - obj_2.row);
    var b = Math.abs(obj_1.column - obj_2.column);
    var c = Math.sqrt(Math.pow(a, 2) +  Math.pow(b, 2));

    return c;
}

function getAdjNodes(node){
    var adj_nodes = [];

    if (node.row != node_array.length - 1)
    {
        var adj = node_array[node.row + 1][node.column];
        if (adj.state != "wall")
            adj_nodes.push(adj);
    }

    if (node.column != node_array[0].length - 1)
    {
        var adj = node_array[node.row][node.column + 1];
        if (adj.state != "wall")
            adj_nodes.push(adj);
    }

    if (node.row != 0)
    {
        var adj = node_array[node.row - 1][node.column];
        if (adj.state != "wall")
            adj_nodes.push(adj);
    }

    if (node.column != 0)
    {
        var adj = node_array[node.row][node.column - 1];
        if (adj.state != "wall")
            adj_nodes.push(adj);
    }

    return adj_nodes;

}

function retracePath(node){
    if(node.state == "start")
        return;
    else {
        retracePath(node.previous_node);
        if(node.state != "end"){
            node.state = "path";
            node.element.style.backgroundColor = path_color;
        }
    }
}


function liveUpdate(){

    for(var i = 0; i < 25; i++){
        for(var j = 0; j < 50; j++){
            if(node_array[i][j].state == "path"){
                node_array[i][j].state = "blank"
                node_array[i][j].element.style.backgroundColor = blank_color;
            }            
            node_array[i][j].distance_from_start = null;
            node_array[i][j].distance_to_end = null;
            node_array[i][j].f_cost = null;
            node_array[i][j].previous_node = null;
        }
    }

    runAStar();
}
