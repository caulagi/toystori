module.exports = {
  variants: {
    toy: {
      resize: {
        detail: "800x600"
      },
      crop: {
        thumb: "200x200"
      }
    },

    gallery: {
      crop: {
        thumb: "100x100"
      }
    }
  },

  storage: {
    S3: {
      key: process.env.AWS_S3_KEY,
      secret: process.env.AWS_S3_SECRET,
      bucket: 'node-s3-test',
      region: 'website-ap-southeast-1'
    }
  },

  debug: true
}
