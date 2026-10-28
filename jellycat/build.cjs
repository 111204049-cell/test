const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "Jellycat：為什麼大人願意買一份不能吃的炸魚薯條？";
const NAVY="14213D", YEL="FCA311", WHITE="FFFFFF", GREY="E5E5E5", INK="1B1B1B", SOFT="FFF4DB";
const F="Microsoft JhengHei";
const notes = [
"【0:00-0:25 開場】大家好。我要分享的是 Jellycat。先問一個問題：如果有一份炸魚薯條，不能吃，你願意買嗎？在倫敦 Selfridges，有人排隊買。我想從行銷角度，看大人為什麼願意買單。",
"【0:25-1:05 案例】Jellycat 在倫敦 Selfridges，把買玩偶設計成逛炸魚薯條店：有餐車、穿制服的店員、服務櫃檯，連包裝都仿照外帶食物。你不是在結帳，你是在點餐、取餐。",
"【1:05-1:50 分析】我的解讀是，這個購買過程本身就有表演性。顧客帶走的不只是玩偶，還有一段自己參與的故事。而這段過程很適合被拍下來、分享出去。所以它的行銷，不是靠廣告，而是靠顧客自己拍、自己說。",
"【1:50-2:20 追問】很多人會說，這是情緒價值。但我想再追問一層：同一隻玩偶，為什麼經過店員的互動和包裝，就讓人覺得更值得買？答案是：價格買的是玩偶，但「值得」來自過程。",
"【2:20-2:50 建議】如果是我，我有三個建議。第一，把設計重心放在「拆開的那一刻」，因為那是最想拍的畫面。第二，包裝和收據要讓人一看就想分享。第三，要小心排隊和流程不能拖垮體驗，體驗再好，也不能蓋過產品本身。",
"【2:50-3:00 收尾】所以回到開頭：大人買的不是不能吃的炸魚薯條，而是一個可以說給別人聽的故事。謝謝大家。"
];
function base(title,n,dark){
  const s=pres.addSlide(); s.background={color:dark?NAVY:WHITE};
  s.addNotes(notes[n-1]);
  s.addText(String(n),{x:9.0,y:5.1,w:0.6,h:0.35,fontFace:F,fontSize:12,color:dark?GREY:"6B6B6B",align:"right",isTextBox:true,margin:0});
  if(title) s.addText(title,{x:0.6,y:0.4,w:8.8,h:0.9,fontFace:F,fontSize:32,bold:true,color:dark?WHITE:NAVY,valign:"middle",isTextBox:true,margin:0});
  return s;
}
// 1 title
let s=pres.addSlide(); s.background={color:NAVY}; s.addNotes(notes[0]);
s.addShape(pres.shapes.OVAL,{x:6.9,y:0.9,w:2.6,h:2.6,fill:{color:YEL},line:{color:YEL}});
s.addText("🐟🍟",{x:6.9,y:0.9,w:2.6,h:2.6,fontSize:60,align:"center",valign:"middle",isTextBox:true,margin:0});
s.addText("Jellycat",{x:0.6,y:1.0,w:6,h:0.7,fontFace:F,fontSize:26,bold:true,color:YEL,isTextBox:true,margin:0});
s.addText("為什麼大人願意買一份不能吃的炸魚薯條？",{x:0.6,y:1.8,w:6.0,h:1.8,fontFace:F,fontSize:36,bold:true,color:WHITE,valign:"top",isTextBox:true,margin:0});
s.addText("行銷 Showcase 期中報告",{x:0.6,y:4.5,w:6,h:0.4,fontFace:F,fontSize:16,color:GREY,isTextBox:true,margin:0});
s.addText("1",{x:9.0,y:5.1,w:0.6,h:0.35,fontFace:F,fontSize:12,color:GREY,align:"right",isTextBox:true,margin:0});
// 2 case
s=base("把買玩偶，變成點餐取餐",2,false);
s.addText("倫敦 Selfridges 的炸魚薯條店體驗",{x:0.6,y:1.3,w:8.8,h:0.4,fontFace:F,fontSize:18,color:"555555",isTextBox:true,margin:0});
const items=[["🚚","餐車"],["🧑‍🍳","穿制服的店員"],["🛎️","服務櫃檯"],["🥡","仿外帶的包裝"]];
items.forEach((it,i)=>{const x=0.6+i*2.25;
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y:2.0,w:2.05,h:2.5,rectRadius:0.15,fill:{color:SOFT},line:{color:SOFT}});
 s.addText(it[0],{x,y:2.2,w:2.05,h:1.1,fontSize:44,align:"center",valign:"middle",isTextBox:true,margin:0});
 s.addText(it[1],{x:x+0.1,y:3.4,w:1.85,h:0.9,fontFace:F,fontSize:18,bold:true,color:NAVY,align:"center",valign:"middle",isTextBox:true,margin:0});});
// 3 analysis
s=base("購買的過程，本身就是表演",3,true);
const st=[["參與","顧客不是結帳，\n而是點餐、取餐"],["故事","帶走玩偶，\n也帶走自己參與的故事"],["分享","過程適合被拍下、\n分享出去"]];
st.forEach((it,i)=>{const x=0.6+i*3.0;
 s.addShape(pres.shapes.OVAL,{x,y:1.8,w:0.8,h:0.8,fill:{color:YEL},line:{color:YEL}});
 s.addText(String(i+1),{x,y:1.8,w:0.8,h:0.8,fontFace:F,fontSize:26,bold:true,color:NAVY,align:"center",valign:"middle",isTextBox:true,margin:0});
 s.addText(it[0],{x,y:2.8,w:2.7,h:0.5,fontFace:F,fontSize:24,bold:true,color:YEL,isTextBox:true,margin:0});
 s.addText(it[1],{x,y:3.4,w:2.7,h:1.2,fontFace:F,fontSize:16,color:WHITE,valign:"top",isTextBox:true,margin:0});});
// 4 question
s=base("追問：同一隻玩偶，為什麼更值得買？",4,false);
const col=[["貨架上的玩偶","直接拿、直接結帳\n買到的是「物品」",GREY,INK],["店員互動 + 包裝","像點餐一樣取得\n買到的是「物品＋故事」",NAVY,WHITE]];
col.forEach((c,i)=>{const x=0.6+i*4.5;
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y:1.7,w:4.1,h:2.6,rectRadius:0.15,fill:{color:c[2]},line:{color:c[2]}});
 s.addText(c[0],{x:x+0.3,y:1.95,w:3.5,h:0.6,fontFace:F,fontSize:22,bold:true,color:i?YEL:NAVY,isTextBox:true,margin:0});
 s.addText(c[1],{x:x+0.3,y:2.7,w:3.5,h:1.3,fontFace:F,fontSize:18,color:c[3],valign:"top",isTextBox:true,margin:0});});
s.addText("價格買的是玩偶，「值得」來自過程",{x:0.6,y:4.55,w:8.8,h:0.5,fontFace:F,fontSize:18,bold:true,color:NAVY,isTextBox:true,margin:0});
// 5 suggestions
s=base("我的三個建議",5,false);
const sg=[["🎁","設計「拆開的那一刻」","那是顧客最想拍的畫面"],["📸","包裝與收據要一看就想分享","讓顧客自己幫品牌說故事"],["⚖️","體驗不能蓋過產品","排隊與流程不能拖垮體驗"]];
sg.forEach((it,i)=>{const y=1.5+i*1.15;
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.6,y,w:8.8,h:0.95,rectRadius:0.12,fill:{color:SOFT},line:{color:SOFT}});
 s.addText(it[0],{x:0.8,y,w:0.9,h:0.95,fontSize:32,align:"center",valign:"middle",isTextBox:true,margin:0});
 s.addText([{text:it[1],options:{bold:true,fontSize:20,color:NAVY,breakLine:true}},{text:it[2],options:{fontSize:15,color:"444444"}}],{x:1.9,y,w:7.3,h:0.95,fontFace:F,valign:"middle",isTextBox:true,margin:0});});
// 6 closing
s=base(null,6,true);
s.addText("大人買的不是炸魚薯條",{x:0.6,y:1.4,w:8.8,h:0.9,fontFace:F,fontSize:36,bold:true,color:WHITE,isTextBox:true,margin:0});
s.addText("而是一個可以說給別人聽的故事",{x:0.6,y:2.4,w:8.8,h:0.9,fontFace:F,fontSize:36,bold:true,color:YEL,isTextBox:true,margin:0});
s.addText("謝謝大家",{x:0.6,y:4.3,w:8,h:0.5,fontFace:F,fontSize:20,color:GREY,isTextBox:true,margin:0});
pres.writeFile({fileName:"Jellycat簡報.pptx"}).then(()=>console.log("ok"));
