"use strict";

const axios = require("axios");

const envalid = require("envalid");
const fs = require("fs");
const fetch = require("node-fetch");

const { API_URL, ACCESS_TOKEN, RapidAPI_Key, RapidAPI_Host } = envalid.cleanEnv(
  process.env,
  {
    API_URL: envalid.str(),
    ACCESS_TOKEN: envalid.str(),
    RapidAPI_Key: envalid.str(),
    RapidAPI_Host: envalid.str(),
  }
);

const fileUploadRequestMutation = /* GraphQL */ `
  mutation fileUploadRequest {
    fileUploadRequest {
      id
      uploadUrl
    }
  }
`;

const libraryTrackCreateMutation = /* GraphQL */ `
  mutation LibraryTrackCreate($input: LibraryTrackCreateInput!) {
    libraryTrackCreate(input: $input) {
      ... on LibraryTrackCreateError {
        message
      }
      ... on LibraryTrackCreateSuccess {
        createdLibraryTrack {
          __typename
          id
        }
      }
    }
  }
`;

const requestFileUpload = async () => {
  const result = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      query: fileUploadRequestMutation,
    }),
    headers: {
      Authorization: "Bearer " + ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  console.log("[info] fileUploadRequest response: ");
  console.log(JSON.stringify(result, undefined, 2));

  return result.data.fileUploadRequest;
};

const uploadFile = async (filePath, uploadUrl) => {
  const result = await fetch(uploadUrl, {
    method: "PUT",
    body: fs.createReadStream(filePath),
    headers: {
      "Content-Length": fs.statSync(filePath).size,
    },
  }).then((res) => res);
  console.log(result);
};

const libraryTrackCreate = async (fileUploadRequestId) => {
  const result = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      query: libraryTrackCreateMutation,
      variables: {
        input: {
          title: "My first libraryTrackCreate 3",
          uploadId: fileUploadRequestId,
        },
      },
    }),
    headers: {
      Authorization: "Bearer " + ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  console.log("[info] libraryTrackCreate response: ");
  console.log(JSON.stringify(result, undefined, 2));

  return result.data.libraryTrackCreate;
};

/* ************************************************************************************** */
const customFunc = () => {
  const videoUrl = "https://www.youtube.com/watch?v=Y7ix6RITXM0"; // have to get URL from airtable form

  // // download video and extract audio stream
  // const stream = ytdl(videoUrl, { quality: "highestaudio" });
  // // convert audio stream to mp3 file
  // ffmpeg(stream)
  //   .format("mp3")
  //   .on("error", (err) => console.error(err))
  //   .on("end", () => console.log("conversion done"))
  //   .pipe(fs.createWriteStream("audio.mp3"));

  const youtube_parser = (url) => {
    var regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return match && match[7].length == 11 ? match[7] : false;
  };

  const youtubeID = youtube_parser(videoUrl);

  const options = {
    method: "get",
    url: "https://youtube-mp36.p.rapidapi.com/dl",
    headers: {
      "X-RapidAPI-Key": RapidAPI_Key,
      "X-RapidAPI-Host": RapidAPI_Host,
    },
    params: {
      id: youtubeID,
    },
  };

  axios(options)
    .then((res) => {
      console.log("11111111111111111111111111111111111111111111111111111");
      console.log(res);
      console.log("11111111111111111111111111111111111111111111111111111");
      main(res.data.link);
    })
    .catch((err) => console.log(err));
};

/* ************************************************************************************** */

const main = async (filePath) => {
  console.log("[info] request file upload");
  const { id, uploadUrl } = await requestFileUpload(filePath);
  console.log(uploadUrl);

  console.log("[info] upload file");
  await uploadFile(filePath, uploadUrl);
  console.log("[info] create InDepthAnalysis");
  await libraryTrackCreate(id);
};

customFunc();
// main(process.argv[2]).catch(err => {
//   console.error(err);
//   process.exitCode = 1;
// });
