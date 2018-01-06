var cmd =require('node-cmd');
var image=require('images');
var px=require('get-pixels');

//adb shell screencap -p /sdcard/q.png 手机截图
//adb pull /sdcard/q.png  ./  图片放入电脑
//del C:\Users\v\q.png 删除电脑的图片
//adb shell rm /sdcard/q.png 删除手机的图片
//adb shell input swipe 20 20 20 20 //模拟按压
//cmd.run('adb shell screencap -p /sdcard/q.png');
//image("C:\\Users\\v\\Desktop\\q.png");

//////////////////////////////////////////////////////////////
///精度不够，有待提高
//忽略alpha通道
var markPosRow=40,
       zoom=100;//图片缩放
function R(pxs,col,row){ return pxs.get(col,row,0)}
function G(pxs,col,row){ return pxs.get(col,row,1)}
function B(pxs,col,row){ return pxs.get(col,row,2)}
function gray(R,G,B){
    return (R*30 + G*58 + B*11 + 50) / 100;
}
//////////////////////////////////////////////////////////////188 190 109
//分数 72 73 75  row:28 col:12
function main(){
    var t_row=-1,t_col=-1;
    console.log('///////////////////////////////////////////////////////');
cmd.get('adb shell screencap -p /sdcard/q.png & adb pull /sdcard/q.png   C:\\Users\\v\\Desktop\\q.png ',function(err,data,stderr){
    image('C:\\Users\\v\\Desktop\\q.png')
    .size(100)
    .save('C:\\Users\\v\\Desktop\\q.png');
    px('C:\\Users\\v\\Desktop\\q.png',function(err,pxs){
             let width_col=pxs.shape[0],
              height_row=pxs.shape[1],
              start={
                ok:false,
                row:0,
                col:0
              },
             end={
                ok:false,
                row:0,
                col:0
              };
            for(let i=markPosRow;i<height_row;i++){
                for(let j=0;j<width_col;j++){
                    //找目的地
                    if(!end.ok&&(R(pxs,j,i)==245&&G(pxs,j,i)==245&&B(pxs,j,i)==245)){
                         console.log("目标坐标:"+"row:"+i+"col:"+j)
                         console.log('已找到白点')
                        end.row=i+1;
                        end.col=j+1;
                        end.ok=true;
                    }
                    //找到球的位置
                    if(!start.ok&&R(pxs,j,i)<=70){
                        let m=0,n=0;
                        for(;m<width_col;m++){
                            if(R(pxs,m,i+1)<=70) break;
                        }
                        //球最后一行所在的位置
                        if(m>=width_col){
                        for(;n<width_col;n++){
                            if(R(pxs,n,i+2)<=70) break;
                        }
                        if(n>=width_col) start.row=i;
                        }
                        //找列
                        if(start.row>0){
                            let q=-1,w=-1;
                            for(let n=0;n<width_col;n++){
                                if(q==-1&&R(pxs,n,start.row)<=70) q=n;
                                //70
                                if(w==-1&&R(pxs,n,start.row)<=70&&R(pxs,n+1,start.row)>70) w=n;
                            }
                            console.log('q'+q+'w'+w)
                            start.col=(w+q)/2;
                        }
                        start.row>0&&start.col>0?start.ok=true:1;
                     /*   console.log("球偏移:"+(gray(R(pxs,j,i),G(pxs,j,i),B(pxs,j,i))-ball))*/
                        start.row>0&&start.col>0? console.log("球坐标:"+"row:"+start.row+"col:"+start.col):1;

                    }
                if(end.ok&&start.break) break; 
                }
                if(end.ok&&start.break) break; 
            }
            start.row+=16;
            //没找到中心点,（第一次）
            if(!end.ok){
                  for(let i=markPosRow;i<height_row;i++){
                    for(let j=1;j<width_col;j++){
                        if(!end.ok&&R(pxs,j,i)!=R(pxs,j-1,i)){
                            end.row=i+12;
                            console.log("目标坐标:"+"row:"+i+"col:"+j)
                            end.col=j;
                            end.ok=true;
                        }
                        if(end.ok)break;
                    }
                        if(end.ok)break;
                }
            }
            //计算距离和压力
            let x=Math.abs(end.row-start.row),y=Math.abs(end.col-start.col);
            let line=Math.sqrt(x*x+y*y);
            line=parseInt(line*12);
            cmd.run(`adb shell input swipe 360 1024 360 1024 ${line}`);
    });
});
}
main();
setInterval(main,3000);