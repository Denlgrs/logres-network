<script lang="ts">
  import { onMount } from "svelte";
  import cytoscape, { type NodeSingular } from "cytoscape";

  let container: HTMLDivElement;
  let selectedNode: NodeSingular | null = null;

  // グラフデータの取得
  const fetchGraphData = async () => {
    const response = await fetch("/player_graph.json");
    const graphData = await response.json();

    return graphData;
  };

  // Cytoscapeの初期化
  const initializeGraph = async () => {
    const graphData = await fetchGraphData();

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

  onMount(() => {
    initializeGraph();
  });
</script>

<div
  bind:this={container}
  style="width: 100vw; height: 100vh;"
></div>