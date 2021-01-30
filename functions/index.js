const functions = require("firebase-functions");
const admin=require("firebase-admin");
admin.initializeApp();
exports.newUserSignup=functions.auth.user().onCreate((user)=>{
  console.log(user);
  return "New User Created";
});

exports.UserDelete=functions.auth.user().onDelete((user)=>{
  admin.database().ref("newUser/"+user.uid).on("value", function( snapshot ) {
    console.log(snapshot.val());
    console.log("hhhhhhh..vvvvv");
  });
  const doc=admin.database().ref("newUser/"+user.uid).remove();
  return doc;
});

/**
 * Adds two numbers together.
 * @param {string} snap
 * @param {int} score The second number.
 * @return {int} The sum of the two numbers.
 */
function calScore( snap ) {
  let score=0;
  const oc=snap.Occupation;
  if (snap.CovidPositive=="Yes") {
    score=score+10;
  }
  if (oc=="Healthcare Workers") {
    score=score+5;
  } else if (oc=="Public Services Staf") {
    score=score+5;
  } else if (snap.Occupation=="Student") {
    score=score+2;
  } else {
    score=score+1;
  }
  if (snap.PreExistingDiebeticCondition=="Yes") {
    score=score+2;
  } else {
    score=score+1;
  }
  if (snap.PreExistingRespiratoryCondition=="Yes") {
    score=score+2;
  } else {
    score=score+1;
  }
  if (snap.AlreadyRecoveredfromCovid19=="Yes") {
    score=score+1;
  } else {
    score=score+2;
  }
  if (snap.HealthInsurance=="Yes") {
    score=score+1;
  } else {
    score=score+2;
  }
  if (snap.Age>0 && snap.Age<=20) {
    score=score+2;
  } else if (snap.Age>20 && snap.Age<=50) {
    score=score+1;
  } else {
    score=score+4;
  }
  return score;
}

const fir=functions.database;
exports.createQueue=fir.ref("newUser/{userUid}").onCreate((snapshot, context)=>{
  const Name=snapshot.val().Name;
  const Email=snapshot.val().Email;
  const PhoneNumber=snapshot.val().PhoneNumber;
  const CovidPositive=snapshot.val().CovidPositive;
  const Occ=snapshot.val().Occupation;
  /*
  const Age=snapshot.val().Age;
  const AlreadyRecoveredfromCovid19=snapshot.val().AlreadyRecoveredfromCovid19;
  const HealthInsurance=snapshot.val().HealthInsurance;
  const PreExistingDiebeticCondition=
  snapshot.val().PreExistingDiebeticCondition;
  const PreExistingRespiratoryCondition=
  snapshot.val().PreExistingRespiratoryCondition;
  */
  const uid=context.params.userUid;
  const score=calScore(snapshot.val());
  const path=uid+"-"+score.toString();
  let count=0;
  const d={"Name": Name, "Email": Email, "PhoneNumber": PhoneNumber};
  if (CovidPositive=="Yes") {
    const path1="DynamicQueue/CovidPositive/count";
    try {
      admin.database().ref(path1).on("value", function( snapshot ) {
        count=snapshot.val().count;
        count=count+1;
        admin.database().ref(path1).set( {"count": count});
      });
    } catch (e) {
      console.log(e);
    }
    admin.database().ref("DynamicQueue/CovidPositive/"+path).set(d);
  } else if (Occ=="Healthcare Workers" || Occ=="Public Services Staf") {
    const path1="DynamicQueue/EmergencyWorkers/count";
    try {
      admin.database().ref(path1).on("value", function( snapshot ) {
        count=snapshot.val().count;
        count=count+1;
        admin.database().ref(path1).set( {"count": count} );
      });
    } catch (e) {
      console.log(e);
    }
    admin.database().ref("DynamicQueue/EmergencyWorkers/"+path).set(d);
  } else {
    const path1="DynamicQueue/secondaryPopulation/count";
    try {
      admin.database().ref(path1).on("value", function( snapshot ) {
        count=snapshot.val().count;
        count=count+1;
        admin.database().ref(path1).set( {"count": count} );
      });
    } catch (e) {
      console.log(e);
    }
    admin.database().ref("DynamicQueue/secondaryPopulation/"+path).set(d);
  }
  console.log("User Uid");
  console.log(snapshot.val());
  return "Queue created Successfully";
});

exports.addScore=fir.ref("newUser/{userUid}").onCreate((snapshot, context)=>{
  const score=calScore(snapshot.val());
  const uid=context.params.userUid;
  admin.database().ref("newUser/"+uid).update( {"score": score} );
});


// /**
//  * Adds two numbers together.
//  * @param {string} path
//  * @return {string} The sum of the two numbers.
//  */
// function getCount( path ) {
//   return new Promise( (resolve, reject)=>{
//     let count =0;
//     admin.database().ref(path).on("value", function( snapshot ) {
//       count=snapshot.val().count;
//     });
//     resolve(count);
//   });
// }
// /**
//  * @return {int} count.
//  */
// function tokenCounter() {
//   return new Promise( (resolve, reject)=>{
//     admin.database().ref("tokenList").on("value", function( snapshot ) {
//
//       if (snapshot.val()==null) {
//         resolve(0);
//       } else {
//         resolve(snapshot.val().tokenCount);
//       }
//     });
//   });
// }

// /**
//  * Adds two numbers together.
//  * @param {string} path
//  * @return {Array} The sum of the two numbers.
//  */
// function test( path ) {
//   return new Promise( (resolve, reject)=>{
//     admin.database().ref(path).on("value", function(snapshot) {
//       const entery=[];
//       snapshot.forEach( function( child ) {
//         if (child.key != "count") {
//           console.log(child.key+": "+child.val().Email);
//           console.log(child.key);
//           entery.push(child.key);
//           console.log("****************3333333333333333***********");
//         }
//       });
//       resolve(entery);
//     });
//   });
// }

// /**
//  * Adds two numbers together.
//  * @param {int} tokeNo
//  * @param {int} count
//  * @param {string} path
//  */
// function addToken( tokeNo, count, path ) {
//   console.log("enter add token");
//   tokeNo=tokeNo+1;
//   admin.database().ref(path).on("value", function(snapshot) {
//     const entery=[];
//     snapshot.forEach( function( child ) {
//       if (child.key != "count") {
//         entery.push(child.key);
//       }
//     });
//     const m=entery;
//     console.log(m);
//     console.log("*****************");
//     const z=[];
//     let x;
//     for (let i=0; i<m.length; i++) {
//       x=m[i].split("-")[0];
//       z[x]=m[i].split("-")[1];
//     }
//     const items = Object.keys(z).map( function( key ) {
//       return [key, z[key]];
//     });
//     items.sort( function(first, second) {
//       return second[1] - first[1];
//     });
//     const sortedList=items.slice(0, count);
//     console.log(sortedList.length);
//     for (let i=0; i<sortedList.length; i++) {
//       const path1="/"+sortedList[i][0]+"-"+sortedList[i][1].toString();
//       admin.database().ref(path+path1).remove();
//       const path3="newUser/"+sortedList[i][0];
//       admin.database().ref(path3).update({
//         "TokenStatus": "Allotted",
//         "TokenNumber": tokeNo,
//       });
//       admin.database().ref(path3).on("value", function( snap ) {
//         const name=snap.val().Name;
//         const email=snap.val().Email;
//         const phone=snap.val().PhoneNumber;
//         const score=snap.val().score;
//         const t=snap.val().TokenNumber;
//         admin.database().ref("tokenList/"+sortedList[i][0]).set( {
//           "Name": name,
//           "Email": email,
//           "PhoneNumber": phone,
//           "score": score,
//           "TokenNumber": t,
//         } );
//       });
//       admin.database().ref("tokenList/").update( {
//         "tokenCount": tokeNo,
//       } );
//       tokeNo=tokeNo+1;
//     }
//   });
// }

// /**
//  * @return {string} output.
//  */
// async function tokenDistributer() {
//   const count=5;
//   const pathList=["CovidPositive", "EmergencyWorkers","secondaryPopulation"];
//   let path="DynamicQueue/"+pathList[0]+"/count";
//   const cnt=await getCount(path);
//   let tokeNo=await tokenCounter();
//   console.log(cnt);
//   console.log(tokeNo);
//   const path1="DynamicQueue/"+pathList[0];
//   if (cnt >= count) {
//     console.log("got in");
//     console.log(cnt);
//     console.log(tokeNo);
//     const count1=cnt-count;
//     admin.database().ref(path).update( {"count": count1} );
//     addToken(tokeNo, count, path1);
//   } else {
//     if (cnt > 0) {
//       admin.database().ref(path).update( {"count": 0} );
//       addToken(tokeNo, cnt, path1);
//     }
//     const count1=count-cnt;
//     path="DynamicQueue/"+pathList[1]+"/count";
//     const cnt1=await getCount(path);
//     tokeNo=await tokenCounter();
//     const path2="DynamicQueue/"+pathList[1];
//     if (cnt1 >= count1) {
//       const count2=cnt1-count1;
//       admin.database().ref(path).update( {"count": count2} );
//       addToken(tokeNo, count1, path2);
//     } else {
//       if (cnt1 > 0) {
//         admin.database().ref(path).update( {"count": 0} );
//         addToken(tokeNo, cnt1, path2);
//       }
//       const count2=count1-cnt1;
//       path="DynamicQueue/"+pathList[2]+"/count";
//       const cnt2=await getCount(path);
//       tokeNo=await tokenCounter();
//       const path3="DynamicQueue/"+pathList[2];
//       if (cnt2 >= count2) {
//         const count3=cnt2-count2;
//         admin.database().ref(path).update( {"count": count3} );
//         addToken(tokeNo, count2, path3);
//       } else {
//         if (cnt2 > 0) {
//           admin.database().ref(path).update( {"count": 0} );
//           addToken(tokeNo, cnt2, path3);
//         }
//       }
//     }
//   }
//   return "Done ...Please check Output";
// }
// exports.assignToken=
//  functions.pubsub.schedule("0 12 * * *").onRun(async (context) => {
//   const a=tokenDistributer();
//   console.log("This will be run every minutes!");
//   console.log(a);
//   return null;
// });
