// 初期
$(function(){
    // データを整形
    var data = {
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

    // 描画
    drawSankeyDiaglram(data);
    
    // svgの大きさを調整
    fitSvg('sankey_svg');
});


// サンキーダイアグラムを描画
function drawSankeyDiaglram(data){
    // 設定
    // 数を表示するかどうか
    // 表示する場合はてきとうな幅に、しない場合は細い幅になる
    var ShowNumber = true;


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
    var nodeWidth = ShowNumber ? 60: 2;
    var layout = d3.sankey()
            .nodeWidth(nodeWidth)
            .extent([[50, 50], [700, 200]]);

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
