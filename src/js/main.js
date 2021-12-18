// 初期
$(function(){
    // データを整形
    var data = {
        'nodes': [
            {'id': 'a', 'title': 'Source'},
            {'id': 'b', 'title': 'Stage 1'},
            {'id': 'c', 'title': 'Stage 2'},
            {'id': 'c1', 'title': 'Stage 2-1'},
            {'id': 'c2', 'title': 'Stage 2-2'}
        ],
        'links': [
            {'source': 'a', 'target': 'b', 'type': 0, 'value': 2},
            {'source': 'a', 'target': 'c', 'type': 1, 'value': 8},
            {'source': 'c', 'target': 'c1', 'type': 1, 'value': 5},
            {'source': 'c', 'target': 'c2', 'type': 2, 'value': 3},
        ]
    };

    // ダイアグラムを定義
    var colors = d3.scaleOrdinal(d3.schemeCategory10);
    var diagram = d3.sankeyDiagram()
                    .linkColor(function(d) { return colors(d.type); });

    // レイアウトを定義
    var layout = d3.sankey()
            .nodeWidth(10)
            .extent([[100, 0], [400, 200]]);

    // 描画
    d3.select('#sankey_svg')
        .datum(layout(data))
        .call(diagram);
})