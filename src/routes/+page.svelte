<script lang="ts">
    import { onMount, tick } from "svelte";
    import { resolve } from '$app/paths';
    import { Slider } from '@skeletonlabs/skeleton-svelte';

    import cytoscape, { type NodeSingular } from "cytoscape";

    let mandora_cy: cytoscape.Core | null = null;
    let kinopo_cy: cytoscape.Core | null = null;

    let mandora_container: HTMLDivElement;
    let kinopo_container: HTMLDivElement;
    let selectedNode: NodeSingular | null = null;

    let fontSize = $state(6);

    // グラフデータの取得
    const fetchGraphData = async (world: string) => {
        const response = await fetch(resolve(`/player_graph_${world}.json`));
        const graphData = await response.json();

        return graphData;
    };

    // Cytoscapeの初期化
    const createGraph = async (world: string, container: HTMLDivElement) => {
        const graphData = await fetchGraphData(world);

        // フォントサイズをノードに設定
        graphData.elements.nodes.forEach((node: any) => {
            node.data.fontSize = fontSize;
        });

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
                "font-size": "data(fontSize)",
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

    let timeout: ReturnType<typeof setTimeout>;
    function updateFontSize(cy: cytoscape.Core, fontSize: number) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            if (!cy) return;

            cy.batch(() => {
                cy.nodes().forEach(node => {
                node.data("fontSize", fontSize);
                });
            });
        }, 60);
    }

    const onFontSizeChange = (details: { value: number[] }) => {
        fontSize = details.value[0];
        if (active === "mandora" && mandora_cy) {
            updateFontSize(mandora_cy, fontSize);
        }
        if (active === "kinopo" && kinopo_cy) {
            updateFontSize(kinopo_cy, fontSize);
        }
    };

</script>


<div class="relative">

    <!-- ネットワーク -->
	<div bind:this={mandora_container} class:hidden={active !== "mandora"} class="relative w-screen h-[100dvh]"></div>

	<div bind:this={kinopo_container} class:hidden={active !== "kinopo"} class="relative w-screen h-[100dvh]"></div>

    <!-- ボタン（上に重ねる） -->
	<div class="absolute bottom-4 right-0 -translate-x-1/2 z-10">
		<nav class="btn-group preset-outlined-surface-200-800 flex-col p-2 md:flex-row backdrop-blur">
			<button
				type="button"
				class="btn capitalize"
				class:preset-filled={active == "mandora"}
				onclick={() => active = "mandora"}
			>
				マンドラ
			</button>
			<button
				type="button"
				class="btn capitalize"
				class:preset-filled={active == "kinopo"}
				onclick={() => active = "kinopo"}
			>
				キノポ
			</button>
		</nav>
	</div>

    <!-- 名前のフォントサイズ調整スライダー -->
    <div class="absolute bottom-6 left-2/7 -translate-x-1/2 z-10 w-80 max-w-1/2">
        <Slider defaultValue={[6]} min={1} max={30} step={0.5} onValueChange={onFontSizeChange} class="p-4 backdrop-blur">
            <Slider.Label>名前の大きさ</Slider.Label>
            <Slider.Control>
                <Slider.Track>
                    <Slider.Range />
                </Slider.Track>
                <Slider.Thumb index={0}>
                    <Slider.HiddenInput />
                </Slider.Thumb>
            </Slider.Control>
            <Slider.MarkerGroup>
                <Slider.Marker value={1} />
                <Slider.Marker value={15} />
                <Slider.Marker value={30} />
            </Slider.MarkerGroup>
        </Slider>
    </div>

</div>