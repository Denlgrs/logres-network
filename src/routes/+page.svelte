<script lang="ts">
  import { onMount } from "svelte";
  import cytoscape from "cytoscape";

  let container: HTMLDivElement;

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
            width: 0.5,
            "line-color": "mapData(weight, 1, 15, blue, red)",
            opacity: 0.3
          }
        }
      ],

      layout: {
        name: "preset"
      },

      wheelSensitivity: 5
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