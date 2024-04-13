

function sendStatement(statement){
    // console.log("Sending statement to LRS")
    const res = fetch('http://demo.darwinboxlocal.com/xAPI/xapi/statements',{
        method:'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(statement)
    })
    // const data = await res.body;
    // console.log(res.json());
    return;
}

module.exports={
  sendStatement
}