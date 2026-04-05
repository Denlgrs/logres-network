import cytoscape from "cytoscape";

const cy = cytoscape({
    container: document.getElementById("cy"),

    elements: [
        { data: { id: "a" } },
        { data: { id: "b" } },
        { data: { id: "ab", source: "a", target: "b" } },
    ],

    style: [
        {
            selector: "node",
            style: {
                label: "data(id)",
            },
        },
        {
            selector: "edge",
            style: {
                width: 2,
            },
        },
    ],

    layout: {
        name: "grid",
    },
});
