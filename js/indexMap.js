var map;
var myVue;
var addpoint = false;  //添加点的判断
var addline = false;  //添加线的判断

$(function () {
    initMap();

    myVue = new Vue({
        el:'#app',
        data:{
            action:'',
            points:[],      // 点的集合
            linepoints:[],  //路线上的点的集合
            mouseMarker:'',  //跟随鼠标移动的marker点
            mouseMarkerTitle:'',  //鼠标移动时显示的label
            lines:[],       //线的集合
            mouseLine:{} ,   //跟随鼠标移动时的虚拟线
            initLine:null,    //初始化时的线
            myIcon: '',
            tmpLabel:'',
            editLine:'',     //可编辑的路线
            dialogVisible:false,   //控制信息框的显示与隐藏
            lineInfo:'',          //路线上的折点组成的字符串  lng,lat；lng,lat...

        },
        methods:{
            //菜单项位置点点击事件
            pointClick:function () {
                this.clear();
                this.action = "point";
                map.disableDoubleClickZoom();
                map.addEventListener('rightclick',myVue.clear);
                map.addEventListener('mousemove',myVue.mouseMove);
                map.addEventListener('click',myVue.addpoint);
            },
            //菜单项线点击事件
            lineClick:function () {
                myVue.clear();
                this.action = "line";
                map.addEventListener('click',this.addLine)
                map.addEventListener('rightclick',myVue.clear);
                map.addEventListener('mousemove',myVue.mouseMove);
            },
            save:function () {
                if (this.editLine!=""){
                    this.editLine.disableEditing();
                    this.linepoints = this.editLine.getPath();
                }

               const {linepoints} = this;
               this.lineInfo = "";
               for(let i=0;i<linepoints.length;i++){
                   this.lineInfo += linepoints[i].lat+','+linepoints[i].lng+';';
               }
                this.dialogVisible = true;
                //console.log(this.linepoints);
            },
            lineEditClick:function () {
                const lines = this.lines;
                for (let i=0;i<lines.length;i++){
                    map.removeOverlay(lines[i]);
                }
                this.lines = [];
                const editline = new BMap.Polyline(myVue.linepoints,{strokeColor: '#00F0f0',strokeWeight:5,strokrOpacity:1});
                map.addOverlay(editline);
                this.editLine = editline;
                editline.enableEditing();
            },
            lineDelClick:function () {
                const lines = this.lines;
                for (let i=0;i<lines.length;i++){
                    map.removeOverlay(lines[i]);
                }
                this.lines = [];
                this.linepoints = [];
            },
            clear:function () {
                map.removeEventListener('mousemove',myVue.mouseMove);
                map.removeEventListener('click',myVue.addpoint);
                map.removeEventListener('click',myVue.addLine);
                map.removeEventListener('rightclick',myVue.clear);
                map.removeOverlay(myVue.mouseMarker);
                this.action = "";
                this.mouseMarker = '';
                if (this.mouseLine!=""){
                    map.removeOverlay(this.mouseLine);
                    this.mouseLine = "";
                }

            },
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(_ => {
                        done();
                    })
                    .catch(_ => {});
            },
            mouseMove:function (e) {
                //console.log(1);
                if (this.action=='point'){
                    myVue.showMousePoint(e);
                }else if(this.action=='line'){
                    myVue.showMouseLine(e);
                }
            },
            addpoint:function (e) {
                if (this.action=='point'){
                    this.$prompt('请输入位置点名称', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                    }).then(({ value }) => {
                        var marker = new BMap.Marker(e.point,{icon:this.myIcon});
                        map.addOverlay(marker);
                        marker.name = value;
                        myVue.points.push(marker);
                        this.$message({
                            type: 'success',
                            message: '位置点: ' + value+'添加成功',
                        });
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '位置点添加失败'
                        });
                    });
                }

            },
            addLine:function (e) {
                if(this.action=='line'){
                    if (this.linepoints.length>0){
                        const line = new BMap.Polyline([this.linepoints[this.linepoints.length-1],e.point],{strokeColor: '#00F0f0',strokeWeight:5,strokrOpacity:1});
                        map.addOverlay(line);
                        this.lines.push(line);
                    }
                    this.linepoints.push(e.point)
                }

            },
            showMouseLine:function (e) {
                if (this.mouseMarker==""){
                    const mouseMarker = new BMap.Marker(e.point,{icon:this.myIcon});
                    map.addOverlay(mouseMarker);
                    this.mouseMarker = mouseMarker;
                }else {
                    this.mouseMarker.setPosition(e.point);
                }
                if (this.linepoints.length>0){
                    const mouseline = new BMap.Polyline([this.linepoints[this.linepoints.length-1],e.point],{strokeColor: '#00F5A9',strokeWeight:5,strokrOpacity:0.3});
                    map.addOverlay(mouseline);
                    map.removeOverlay(this.mouseLine);
                    this.mouseLine = mouseline;
                }
            },
            showMousePoint:function (e) {
                if (this.mouseMarker==""){
                    this.mouseMarker = new BMap.Marker(e.point,{icon:this.myIcon});
                    map.addOverlay(this.mouseMarker);
                }
                this.mouseMarker.setPosition(e.point);
            },
            deletePoint:function () {

            },
            toCenter:function (i) {
               if (myVue.tmpLabel!=''){
                   map.removeOverlay(myVue.tmpLabel);
                   myVue.tmpLabel = '';
               }
                map.panTo(myVue.points[i].point);
                var str = " <div class='point_label'> "+myVue.points[i].name+"</div>";
                const label = new BMap.Label(str,{position:myVue.points[i].point});
                myVue.tmpLabel = label;
                map.addOverlay(label);

            }
        },
        mounted:function () {

            var myIcon = new BMap.Icon("imgs/point.png", new BMap.Size(40, 50))
                myIcon.setImageSize(new BMap.Size(40,50));
            this.myIcon = myIcon;
            this.points = initPoints();

        }
    })



})

function initPoints(){
    var myIcon = new BMap.Icon("imgs/point.png", new BMap.Size(40, 50))
    myIcon.setImageSize(new BMap.Size(40,50));

    var marker = [];
    marker[0] = new BMap.Marker(new BMap.Point(118.082868,36.829153),{icon:myIcon});
    marker[0].name = "东方实验学校";
    marker[1] = new BMap.Marker(new BMap.Point(118.075933,36.830077),{icon:myIcon});
    marker[1].name = "东方星城";

    marker[2] = new BMap.Marker(new BMap.Point(118.067365,36.834728),{icon:myIcon});
    marker[2].name = "温馨家园";

    marker[3] = new BMap.Marker(new BMap.Point(118.070112,36.83906),{icon:myIcon});
    marker[3].name = "魏家庄";

    marker[4] = new BMap.Marker(new BMap.Point(118.0575,36.829644),{icon:myIcon});
    marker[4].name = "流泉新村";

    marker[5] = new BMap.Marker(new BMap.Point(118.0564458,36.838945),{icon:myIcon});
    marker[5].name = "中房翡翠园";

    marker[6] = new BMap.Marker(new BMap.Point(118.055272,36.833977),{icon:myIcon});
    marker[6].name = "柳泉中学";

    marker[7] = new BMap.Marker(new BMap.Point(118.042174,36.834829),{icon:myIcon});
    marker[7].name = "金丽大厦";

    marker[8] = new BMap.Marker(new BMap.Point(118.047978,36.830424),{icon:myIcon});
    marker[8].name = "淄博市公安局";

    for (let i=0;i<marker.length;i++){
        map.addOverlay(marker[i]);
    }
    return marker;
}



/*initMap();*/











function initMap() {
    map = new BMap.Map('map');
    var center = new BMap.Point(118.065728,36.818262);
    map.centerAndZoom(center, 15);
    map.enableScrollWheelZoom();
}