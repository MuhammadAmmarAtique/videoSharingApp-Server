import asyncHandler from "../utils/asyncHandler.js";

const publishVideo = asyncHandler(async (req, res) => {
  const {name} = req.body
  console.log("name: ", name);
  console.log("work in progressss");
  
  res.send("on a new journeyssss");
});

export { publishVideo };
