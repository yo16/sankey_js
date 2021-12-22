// 使用するモジュール
// https://github.com/ricklupton/d3-sankey-diagram

// 初期
$(function(){
    // トリガー
    $("#btn_download").click(function(){
        downloadSVG('sankey_svg');
    });

    // データを整形
    var sample_data = getSampleData();

    // 描画
    drawSankeyDiaglram(sample_data);
    
    // svgの大きさを調整
    fitSvg('sankey_svg');
});


// サンプルデータ（外に出したかった）
function getInitialData(){
    return {
        'nodes': [
            {'id': 'TOP', 'title': 'TOP'},
            {'id': 'C11', 'title': 'Contents1-1'},
            {'id': 'C12', 'title': 'Contents1-2'},
            {'id': 'C21', 'title': 'Contents2-1'},
            {'id': 'C22', 'title': 'Contents2-2'},
            {'id': 'C23', 'title': 'Contents2-3'},
            {'id': 'C31', 'title': 'Contents3-1'},
            {'id': 'C32', 'title': 'Contents3-2'}
        ],
        'links': [
            {'source': 'TOP', 'target': 'C11', 'type': 0, 'value': 6},
            {'source': 'TOP', 'target': 'C12', 'type': 1, 'value': 4},
            {'source': 'C11', 'target': 'C21', 'type': 0, 'value': 1},
            {'source': 'C11', 'target': 'C22', 'type': 0, 'value': 4},
            {'source': 'C11', 'target': 'C23', 'type': 0, 'value': 1},
            {'source': 'C12', 'target': 'C21', 'type': 1, 'value': 3},
            {'source': 'C12', 'target': 'C22', 'type': 1, 'value': 1},
            {'source': 'C21', 'target': 'C31', 'type': 1, 'value': 2},
            {'source': 'C21', 'target': 'C32', 'type': 1, 'value': 2},
            {'source': 'C22', 'target': 'C31', 'type': 0, 'value': 3},
            {'source': 'C22', 'target': 'C32', 'type': 0, 'value': 2},
            {'source': 'C23', 'target': 'C32', 'type': 0, 'value': 1}
        ],
        'groups': [
            {'title': 'start',
             'nodes': ['TOP']},
             {'title': 'Step1',
              'nodes': ['C11','C12']},
             {'title': 'Step2',
              'nodes': ['C21','C22','C23']},
            {'title': 'Step3',
             'nodes': ['C31','C32']}
        ]
    };
}


// サンキーダイアグラムを描画
function drawSankeyDiaglram(data){
    // - - - - 設定 - - - -
    // 数を表示するかどうか
    // 表示する場合はてきとうな幅に、しない場合は細い幅になる
    var ShowNumber = true;
    // Nodeの長方形の横幅
    var NodeWidth = 60;
    // 横方向のNode間の距離
    var NodeDistanceX = NodeWidth * 3;   // 大体
    // 縦方向のNode間の距離
    var NodeDistanceY = 80;
    // 左上の位置
    var StartPos = 50;  // 仮で固定.ずらしたくなったらここを調整.自動ではやらない.
    // - - - - - - - - - -

    // ダイアグラムを定義
    var colors = d3.scaleOrdinal(d3.schemeCategory10);
    var diagram = d3.sankeyDiagram()
                    .linkColor(function(d) { return colors(d.type); })
                    .nodeValue(function(d) {
                        return ShowNumber ? Number(d.value).toLocaleString() :'';
                    })
                    .groups(data.groups)
    ;

    // レイアウトを定義
    var useNodeWidth = ShowNumber ? NodeWidth: 2;
    var layoutWidth = data.groups.length * (NodeDistanceX + NodeWidth);
    var groupElms = [...data['groups']].map((d) => d.nodes.length);
    var layoutHeight = NodeDistanceY * Math.max(...groupElms);
    var layout = d3.sankey()
            .nodeWidth(useNodeWidth)
            .extent([[StartPos, StartPos], [layoutWidth, StartPos+layoutHeight]]);

    // 描画
    d3.select('#sankey_svg')
        .datum(layout(data))
        .call(diagram);
}


// svgのwidthとheightをその下のgに合わせる
function fitSvg(svg_id){
    var svg = $("#"+svg_id);
    var g = $("#"+svg_id+" g");
    var g_rect = g[0].getBoundingClientRect()
    svg.width(g_rect.x + g_rect.width);
    svg.height(g_rect.y + g_rect.height);
}


// SVGをダウンロードさせる
function downloadSVG(svg_id) {
    var filename = "chart.svg";

    var DOMURL = window.URL || window.webkitURL || window;
    var svgElm = d3.select("#"+svg_id);
    var svgData = (new XMLSerializer()).serializeToString(svgElm.node());

    var svgBlob = new Blob(
        [svgData],
        { "type" : "text/xml" }
    );
    var url = DOMURL.createObjectURL(svgBlob);
    var a = d3.select("body").append("a")
    
    a.attr("class", "downloadLink")
        .attr("download", "chart.svg")
        .attr("href", url)
        .text("test")
        .style("display", "none")
        
        a.node().click()

    setTimeout(function() {
        window.URL.revokeObjectURL(url)
        a.remove()
    }, 10)
}
