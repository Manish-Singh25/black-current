const switchTab=document.querySelectorAll('.switch');
const tab=document.querySelector('.form');
const login=document.querySelector('.login');
const register=document.querySelector('.register');
const signOut=document.querySelector('.signout');
const deleteRequest=document.querySelector('.delete-request');
const home=document.querySelector('.home');
const body=document.querySelector('.main');
const man=document.querySelector(".mancheck");
switchTab.forEach(link => {
  link.addEventListener('click',()=>{
    const tab1=tab.querySelectorAll('.modal')
    tab1.forEach(modal => modal.classList.toggle('active'));
  });
});


function getLoginUserData(){
 
    const userId = firebase.auth().currentUser.uid;
    firebase.database().ref('newUser/'+userId).on("value",function(snapshot){
        home.querySelector('.name').textContent=snapshot.val().Name;
        home.querySelector('.email').textContent=snapshot.val().Email;
        home.querySelector('.age').textContent=snapshot.val().Age;
        home.querySelector('.occupation').textContent=snapshot.val().Occupation;
        home.querySelector('.respiratory').textContent=snapshot.val().PreExistingRespiratoryCondition;
        home.querySelector('.diebetic').textContent=snapshot.val().PreExistingDiebeticCondition;
        home.querySelector('.covid-positive').textContent=snapshot.val().CovidPositive;
        home.querySelector('.covid-recovered').textContent=snapshot.val().AlreadyRecoveredfromCovid19;
        home.querySelector('.insurance').textContent=snapshot.val().HealthInsurance;
        if(snapshot.val().TokenStatus=='Not Allotted'){
            home.querySelector('.token').textContent='Please Wait.Token Not Allotted';
        }else{
            home.querySelector('.token').textContent=snapshot.val().TokenNumber; 
        }
        console.log(snapshot.val());
    }, function (error) {
        console.log("Error: " + error.code);
        });
}

login.addEventListener('submit',(e)=>{
    e.preventDefault();
    const email=login.email.value;
    const password=login.password.value;
    firebase.auth().signInWithEmailAndPassword(email,password).then(()=>{
        login.reset();
        getLoginUserData();
    }).catch((e)=>{
        login.querySelector('.error').textContent=e.message;
    })
});

register.addEventListener('submit',(e)=>{
    e.preventDefault();  
    const email=register.email.value;
    const password=register.password.value;
    const name=register.name.value;
    const age=register.age.value;
    const respiratory=register.Respiratory.value;
    const occupation=register.Occupation.value;
    const diebetic=register.Diebetic.value;
    const covidPositive=register.covidPositive.value;
    const recovered=register.Recovered.value;
    const insurance=register.Insurance.value;
    const PhoneNumber=register.phone.value;
    
    firebase.auth().createUserWithEmailAndPassword(email,password).then(()=>{
        const userId = firebase.auth().currentUser.uid;
        firebase.database().ref('newUser/'+userId).set({
            'Name':name,
            'Age':age,
            'PhoneNumber':PhoneNumber,
            'Email':email,
            'Password':password,
            'HealthInsurance':insurance,
            'AlreadyRecoveredfromCovid19':recovered,
            'CovidPositive':covidPositive,
            'PreExistingDiebeticCondition':diebetic,
            'Occupation':occupation,
            'PreExistingRespiratoryCondition':respiratory,
            'TokenStatus':'Not Allotted',
        });
        console.log('Registered');
        register.reset();
    }).catch((e)=>{
        register.querySelector('.error').textContent=e.message;
    })

});

signOut.addEventListener('click',()=>{
    firebase.auth().signOut().then(()=>{
        console.log('SignOut');
    });
});

deleteRequest.addEventListener('click',()=>{
    firebase.auth().currentUser.delete();
});

firebase.auth().onAuthStateChanged((user) => {
    if (user){
        tab.classList.remove('open');
        tab.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
        home.classList.add('open');
        body.classList.remove('showbg');
        getLoginUserData();
    }else{
        tab.classList.add('open');
        tab.querySelectorAll('.modal')[0].classList.add('active');
        home.classList.remove('open');
        body.classList.add('showbg');
        
    }
});

async function addTokenAll(tokeNo,path){
    return new Promise((resolve,reject)=>{
    console.log("enter add token all");
    let entery=[];
    let detail=[];
    
    tokeNo=tokeNo+1;
    firebase.database().ref(path).on("value", function(snapshot) {
        entery=[];
        detail=[];
        console.log("////////////////////9999999999999999999\\\\\\\\\\\\\\\\\\\\\\\\ ");
       
        console.log("////////////////99999999999999\\\\\\\\\\\\\ ");
        snapshot.forEach(function(child) {
            if(child.key != "count"){
                console.log(child.key+": "+child.val().Email);
                console.log(child.key);
                entery.push(child.key);
                let name=child.val().Name;
                let email=child.val().Email;
                let phone=child.val().PhoneNumber;
                detail.push([name,email,phone]);
                console.log("****************3333333333333333*************");
            }
          });
          
         
          console.log(entery);
          detail.reverse();
          try{
          for(let i=0;i<entery.length;i++){
            console.log(entery.length);
            console.log(entery[i]);
            console.log("/////////////////////**************");
            console.log(tokeNo);
            let uid=entery[i].split("-")[0];
            firebase.database().ref("newUser/"+uid.toString()).update( {
                "TokenNumber":tokeNo,
                "TokenStatus":"Allotted",
            } );
            firebase.database().ref(path+"/count").update({"count":0 });
            firebase.database().ref(path+"/"+entery[i]).remove();
            let m=detail.pop();
            console.log(m);
            firebase.database().ref("tokenList/"+uid).set({
                "Name":m[0],
                "Email":m[1],
                "PhoneNumber":m[2],
            });
            firebase.database().ref("tokenList/").update({
                "tokenCount":tokeNo,
            });
            
            tokeNo=tokeNo+1;
          }
        }catch(e){}
    });
    resolve("go");  
}); 
}

async function test(path){
    return new Promise((resolve,reject)=>{
        firebase.database().ref(path).on("value", function(snapshot) {
            let entery=[];
            snapshot.forEach(function(child) {
                if(child.key != "count"){
                    console.log(child.key+": "+child.val().Email);
                    console.log(child.key);
                    entery.push(child.key);
                    console.log("****************3333333333333333*************");
                }
            });
            resolve(entery);
        });
    });
}
async function addToken(tokeNo,count,path){
    console.log("enter add token");
    tokeNo=tokeNo+1;
    let m=await test(path);
    console.log(m);
    console.log("*****************")
    let z=[];
    let x;
    for(var i=0; i<m.length; i++){ 
        x=m[i].split("-")[0];
        z[x]=m[i].split("-")[1];
     }
    let items = Object.keys(z).map(function(key) {
    return [key, z[key]];
    });
    // Sort the array based on the second element
    items.sort(function(first, second) {
    return second[1] - first[1];
    });
    let sortedList=items.slice(0, count);
    console.log(sortedList.length);
    for (let i=0;i<sortedList.length;i++){
       let path1="/"+sortedList[i][0]+"-"+sortedList[i][1].toString();
       firebase.database().ref(path+path1).remove();
       let path3="newUser/"+sortedList[i][0];
       firebase.database().ref(path3).update({
        "TokenStatus":"Allotted",
        "TokenNumber":tokeNo,
    });
      firebase.database().ref(path3).on("value",function(snap){
           let name=snap.val().Name;
           let email=snap.val().Email;
           let phone=snap.val().PhoneNumber;
           let score=snap.val().score;
           let t=snap.val().TokenNumber;
          firebase.database().ref("tokenList/"+sortedList[i][0]).set({
               "Name":name,
               "Email":email,
               "PhoneNumber":phone,
               "score":score,
               "TokenNumber":t,               
           });
       });
       
    firebase.database().ref("tokenList/").update({
        "tokenCount":tokeNo,
    });

    tokeNo=tokeNo+1;
    }   
}

function getCount(path){
    return new Promise((resolve,reject)=>{
        firebase.database().ref(path).on("value", function( snapshot ) {
            resolve(snapshot.val().count);
        });
    });
}
function tokenCounter(){
    return new Promise((resolve,reject)=>{
        firebase.database().ref('tokenList').on("value", function( snapshot ) {
            if(snapshot.val()==null){
                resolve(0);
            }else{
                resolve(snapshot.val().tokenCount);
            }
            
        });
    });
}
async function  tokenDistributer(){
    let count=1;
  const pathList=["CovidPositive", "EmergencyWorkers", "secondaryPopulation"];
      let path="DynamicQueue/"+pathList[0]+"/count";
      let cnt= await getCount(path);
      let tokeNo= await tokenCounter();
      console.log(cnt);
      console.log(tokeNo);
      let path1="DynamicQueue/"+pathList[0];
    if (cnt >= count ) {
        console.log("got in");
        console.log(cnt);
        console.log(tokeNo);
        //console.log(snapshot.val().count >= (3-count));
        let count1=cnt-count;
        firebase.database().ref(path).update( {"count": count1} );
        addToken(tokeNo,count,path1);
    } else { 
          if(cnt>0){
            firebase.database().ref(path).update( {"count": 0} );
            let q=await addToken(tokeNo,cnt,path1);
          }
          let count1=count-cnt;
          path="DynamicQueue/"+pathList[1]+"/count";
          let cnt1= await getCount(path);
          tokeNo= await tokenCounter();
          let path2="DynamicQueue/"+pathList[1];
          if (cnt1 >= count1 ) {
            let count2=cnt1-count1;
            firebase.database().ref(path).update( {"count": count2} );
            addToken(tokeNo,count1,path2);
          }else{
            if(cnt1>0){
                firebase.database().ref(path).update( {"count": 0} );
                let q1=await addToken(tokeNo,cnt1,path2);
              }
                let count2=count1-cnt1;
                path="DynamicQueue/"+pathList[2]+"/count";
                let cnt2= await getCount(path);
                tokeNo= await tokenCounter();
                let path3="DynamicQueue/"+pathList[2];
                if (cnt2 >= count2 ) {
                    let count3=cnt2-count2;
                    firebase.database().ref(path).update( {"count": count3} );
                    addToken(tokeNo,count2,path3);
                }else{
                    if(cnt2>0){
                        firebase.database().ref(path).update( {"count": 0} );
                        let q2=await addToken(tokeNo,cnt2,path3);
                    }
                }
          }

    }
} 

  
man.addEventListener('click',()=>{
    tokenDistributer();
});

//https://www.youtube.com/watch?v=D4wgrgb24o0
//https://crontab.guru/#0_12_*_*_*