// 使用するモジュール
// https://github.com/ricklupton/d3-sankey-diagram

// 初期
$(function(){
    // トリガー
    // ファイルドロップ（document全体）
    $(document).on("dragover", (e_)=>{
        var e = e_.originalEvent;
        e.preventDefault();
    });
    /*
    $(document).on("dragleave", (e_)=>{
        var e = e_.originalEvent;
        e.stopPropagation();
        e.preventDefault();

        $("#fade_layer").fadeIn("fast");    // 未実装
        //$("#fade_layer").show();
    });
    */
    $(document).on("drop", (e_)=>{
        var e = e_.originalEvent;
        e.stopPropagation();
        e.preventDefault();

        // ファイルを読んで描画
        var files = e.dataTransfer.files;
        var file = files[0];
        var file_type = file.name.split('.')[1].toUpperCase();
        $("#alert_message").text("");
        if( file_type!='CSV' && file_type!='TSV' && file_type!='JSON' ){
            $("#alert_message").text('Drop ".csv" or ".tsv" or ".json" file!');
            return;
        }

        // 説明をクリア
        $('#sample').remove();

        var fr = new FileReader();
        fr.readAsText(file);
        fr.onload = (e)=>{
            const text = e.target.result;
            var data = NaN;

            // CSV or TSV
            if( file_type=='CSV' || file_type=='TSV' ){
                // CSV,TSVから配列変換
                const csv_array = text.split(/[\r\n]+/).map(
                    (row) => 
                        row
                            .split(/[,\t]/)
                            .map((v)=>v.replace(/ /g,''))
                );
        
                // Sankeyダイアグラム用の構造へ変換
                data = formatForSankey(csv_array);

            // json
            }else{
                data = JSON.parse(text);
            }

            // Sankeyダイアグラムを表示
            drawSankeyDiagram(data);

        }
    });
    
    // ボタン
    $('#btn_download_svg').click(()=>{
        downloadSVG('sankey_svg');
    });
    $('#btn_download_png').click(()=>{
        downloadPNG('sankey_svg');
    });

    // サンプルデータの取得
    var sample_data = getSampleData();

    // 描画
    drawSankeyDiagram(sample_data);
    
    // svgの大きさを調整
    fitSvg('sankey_svg');
});


// サンプルデータ（外に出したかった）
function getSampleData(){
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
            {'title': 'Start',
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
function drawSankeyDiagram(data){
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
    var sankey_svg_id = '#sankey_svg';

    // svg要素を初期化
    $(sankey_svg_id).empty();

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
    d3.select(sankey_svg_id)
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


// CSVの配列データをSankeyDiagram用の構造へ変換して返す
function formatForSankey(ar){
    var nodes = [];
    var node_names = new Set();
    var links = [];
    var link_fromto = new Set(); // from-toを無理やり１つの文字列にして使う
    var link_fromto_index = [];     // 名前からlinksのindexを得るための配列
    var groups = [];
    var getNodeName = (group_idx, node_name) => 'n_'+group_idx+'_'+node_name;
    var getLinkName = (node1, node2) => 'l_' + node1 + '_' + node2;

    // Nodeの流入/流出情報
    var node_flow = {};
    
    // 1要素目はグループ名
    for (const grp of ar[0]) {
        groups.push({'title': grp, 'nodes': []});
    }
    // 2要素目以降はリンク
    for(var i=1; i<ar.length; i++){
        const row = ar[i];
        for (var j=0; j<row.length; j++){
            const node = row[j];
            const node_name = getNodeName(j,node);
            
            // Node
            if( !node_names.has(node_name) ){
                // 未登録 ---
                // Node追加
                node_names.add(node_name);
                nodes.push({
                    'id': node_name,
                    'title': node
                });
                // Group追加
                groups[j]['nodes'].push(node_name);

                // NodeFlow追加
                node_flow[node_name] = {'from': {}, 'to': {}, 'isFirstGroup':j==0?true:false};
            }
            // NextNodeも
            if( j<row.length-1 ){   // 次がある
                const next_node_name = getNodeName(j+1, row[j+1]);
                if( !node_names.has(next_node_name) ){
                    // 未登録 ---
                    // Node追加
                    node_names.add(next_node_name);
                    nodes.push({
                        'id': next_node_name,
                        'title': row[j+1]
                    });
                    // Group追加
                    groups[j+1]['nodes'].push(next_node_name);
    
                    // NodeFlow追加(必ずfirstではない)
                    node_flow[next_node_name] = {'from': {}, 'to': {}, 'isFirstGroup':false};
                }
            }

            // Link
            if( j<row.length-1 ){   // 次がある
                const cur_node_name = node_name;
                const next_node_name = getNodeName(j+1, row[j+1]);
                const link_name = getLinkName(cur_node_name, next_node_name);
                if( link_fromto.has(link_name) ){
                    // 登録済み ---
                    // Linkカウントアップ
                    const link_index = 
                        link_fromto_index.findIndex(e=>e===link_name);
                    links[link_index]['value']++;
                }else{
                    // 未登録 ---
                    // Link追加
                    link_fromto.add(link_name);
                    link_fromto_index.push(link_name);
                    links.push({
                        'source': cur_node_name,
                        'target': next_node_name,
                        'type': 0,
                        'value': 1
                    });

                    // NodeFlow追加
                    // from側のtoにnextを登録
                    if( next_node_name in node_flow[cur_node_name]['to'] ){
                        // toに登録済み
                        node_flow[cur_node_name]['to'][next_node_name] += 1;
                    }else{
                        // toに未登録
                        node_flow[cur_node_name]['to'][next_node_name] = 1;
                    }
                    // to側のfromにcurを登録
                    if( cur_node_name in node_flow[next_node_name]['from'] ){
                        // fromに登録済み
                        node_flow[next_node_name]['from'][cur_node_name] += 1;
                    }else{
                        // fromに未登録
                        node_flow[next_node_name]['from'][cur_node_name] = 1;
                    }

                }
            }
        }
    }

    // Linkのtype更新
    // トップのノードのみ
    var i=0;
    for( const node_name of [...node_names].filter(n => node_flow[n]['isFirstGroup']) ){
        for( let next_node_name in node_flow[node_name]['to'] ){
            const link_name = getLinkName(node_name, next_node_name);
            const link_index = link_fromto_index.findIndex(e => e===link_name);
            links[link_index]['type'] = i;
            i++;
        }
    }
    // トップより後のノードのみ
    for(let i=1; i<groups.length; i++){
        for( const node_name of groups[i]['nodes']){
            // fromの中の一番多い流れをくむ
            let max_flow = -1;
            let max_flow_link_type = -1;
            for( let from_node_name in node_flow[node_name]['from'] ){
                const link_name = getLinkName(from_node_name, node_name);
                const link_index = link_fromto_index.findIndex(e => e===link_name);
                if( max_flow < links[link_index]['value'] ){
                    max_flow = links[link_index]['value'];
                    max_flow_link_type = links[link_index]['type'];
                }
            }
            // 自分のtoは全部、maxのtypeを使う
            for( let next_node_name in node_flow[node_name]['to'] ){
                const link_name = getLinkName(node_name, next_node_name);
                const link_index = link_fromto_index.findIndex(e => e===link_name);
                links[link_index]['type'] = max_flow_link_type;
            }
        }

        const ret = {'nodes': nodes, 'links': links, 'groups': groups};
        //console.log(ret);
        return ret;
    }
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
    var a = d3.select("body").append("a");
    
    a.attr("class", "downloadLink")
        .attr("download", filename)
        .attr("href", url)
        .text("download")
        .style("display", "none");
        
    a.node().click();

    setTimeout(function() {
        window.URL.revokeObjectURL(url)
        a.remove()
    }, 10);
}

// PNGをダウンロードさせる
function downloadPNG(svg_id){
    var filename = "chart.png";
    var d3svgElm = d3.select("#"+svg_id);
    var width = $("#"+svg_id).width();
    var height = $("#"+svg_id).height();

    var d3cvs = d3.select("body").append("canvas");
    d3cvs.attr("id", "canvas_download")
        .attr("width", width)
        .attr("height", height)
        .style("display", "none");
    
    var cvs = $("#canvas_download")[0];
    var ctx = cvs.getContext("2d");
    var svg = $("#"+svg_id);
    svg.attr("viewBox", "0 0 "+width+" "+height);

    var svg_data = new XMLSerializer().serializeToString(svg[0]);
    var imgsrc = "data:image/svg+xml;charset=utf-8;base64,"
        + btoa(unescape(encodeURIComponent(svg_data)));
    var img = new Image();
    img.onload = function(){
        ctx.drawImage(img, 0, 0);

        var url = cvs.toDataURL("image/png");
        var a = d3.select("body").append("a");
        
        a.attr("type", "application/octet-stream")
            .attr("download", filename)
            .attr("href", url)
            .text("download")
            .style("display", "none");
            
        a.node().click();
    
        setTimeout(function() {
            window.URL.revokeObjectURL(url);
            a.remove();
            d3cvs.remove();
        }, 10);
    }
    img.src = imgsrc;
}