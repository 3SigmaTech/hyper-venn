export default function calculateIntersections(data, labels) {
    let intersections = { areas: 0 };
    for (let i = 0; i < data.length; i++) {
        let name = 'S' + i;
        let index = [i];
        let arr = data[i];
        intersections[name] = _createIntersection(index, arr, name, labels);
        intersections.areas++;
        _intersect(intersections, intersections[name], data, labels);
    }
    return intersections;
}

function _createIntersection(index, arr, name, labels) {
    let myLabel = "";
    for (let i = 0; i < index.length; i++) {
        myLabel += (myLabel ? " &#8745; " : "") + labels[index[i]];
    }

    return {
        name: name,
        index: index,
        label: myLabel,
        array: arr,
        size: arr.length
    };
}

function _intersect(intersections, intersection, data, labels) {
    let mini = intersection.index[intersection.index.length - 1] + 1;
    for (let i = mini; i < data.length; i++) {
        let myIndex = intersection.index.concat([i]);
        let myName = intersection.name + 'n' + i;
        let mySet = _intersectionOf(intersection.array, data[i]);
        intersections[myName] = _createIntersection(myIndex, mySet, myName, labels);
        intersections.areas++;
        _intersect(intersections, intersections[myName], data, labels);
    }
}

function _intersectionOf(arr1, arr2) {
    var result = [];
    if (arr1.length == 0 || arr2.length == 0) {
        return result;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr2.indexOf(arr1[i]) >= 0) {
            result.push(arr1[i]);
        }
    }
    return result;
}
