<script lang="ts">
    import { onMount, tick } from "svelte";
    import { resolve } from '$app/paths';

    import cytoscape, { type NodeSingular } from "cytoscape";

    let mandora_cy: cytoscape.Core;
    let kinopo_cy: cytoscape.Core;

    let mandora_container: HTMLDivElement;
    let kinopo_container: HTMLDivElement;
    let selectedNode: NodeSingular | null = null;

    // グラフデータの取得
    const fetchGraphData = async (world: string) => {
        const response = await fetch(resolve(`/player_graph_${world}.json`));
        const graphData = await response.json();

        return graphData;
    };

    // Cytoscapeの初期化
    const createGraph = async (world: string, container: HTMLDivElement) => {
        const graphData = await fetchGraphData(world);

        const cy = cytoscape({
        container,

        elements: [
            ...graphData.elements.nodes,
            ...graphData.elements.edges
        ],

        style: [
            {
            selector: "node",
            style: {
                label: "data(name)",
                "font-size": 4,
                width: "data(size)",
                height: "data(size)",
                "background-color": "data(rgb)" // 事前に "rgb(...)" 文字列を入れておく前提
                
            }
            },
            {
            selector: "edge",
            style: {
                width: 0.4,
                "line-color": "mapData(weight, 1, 15, blue, red)",
                opacity: 0.6
            }
            },
            {
            selector: ".faded",
            style: {
                opacity: 0.2
            }
            }
        ],

        layout: {
            name: "preset"
        },

        wheelSensitivity: 5
        });

        // 隣接強調処理
        const highlightNeighborhood = (node: NodeSingular) => {
        // 全体を薄く
        cy.elements().addClass("faded");

        // 対象ノードとその周辺を強調
        node.closedNeighborhood().removeClass("faded");
        };

        // リセット処理
        const clearHighlight = () => {
            cy.elements().removeClass("faded");
        };

        // PC（ホバー）
        cy.on("mouseover", "node", (e) => {
            highlightNeighborhood(e.target);
        });

        cy.on("mouseout", "node", () => {
            clearHighlight();
        });

        // スマホ（タップ）
        cy.on("tap", "node", (e) => {
        const node = e.target;

        if (selectedNode === node) {
            clearHighlight();
            selectedNode = null;
        } else {
            highlightNeighborhood(node);
            selectedNode = node;
        }
        });

        return cy;
    };

    let active = $state('mandora');

    onMount(async () => {
        mandora_cy = await createGraph("mandora", mandora_container);
        kinopo_cy = await createGraph("kinopo", kinopo_container);
    });

    const getActive = () => (active);
    $effect: if (getActive() == "mandora") {
        tick().then(() => {
            if (mandora_cy) {
                mandora_cy.fit();
            }
        });
    }

    $effect: if (getActive() == "kinopo") {
        tick().then(() => {
            if (kinopo_cy) {
                kinopo_cy.fit();
            }
        });
    }

    
</script>

<div class="flex justify-center" style="margin-top: 1em;">
    <nav class="btn-group preset-outlined-surface-200-800 flex-col p-2 md:flex-row">
        <button type="button" class="btn capitalize" class:preset-filled={active == "mandora"} onclick={() => active = "mandora"}>
            マンドラ
        </button> 
        <button type="button" class="btn capitalize" class:preset-filled={active == "kinopo"} onclick={() => active = "kinopo"}>
            キノポ
        </button>  
    </nav>
</div>

<div>

	<div bind:this={mandora_container} class:hidden={active !== "mandora"} class="relative w-screen h-screen"></div>

	<div bind:this={kinopo_container} class:hidden={active !== "kinopo"} class="relative w-screen h-screen"></div>

</div>