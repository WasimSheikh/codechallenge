module.exports.isEmpty =(params)=>{
  return (params && params.length <= 0)
}
module.exports.missingParamError = (res)=> {
  res.status(400);
  res.json(
    {
      errorMessage: "Missing required parameter."
    }
  )
  return;
} 
