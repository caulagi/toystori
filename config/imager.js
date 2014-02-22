module.exports = {
  variants: {
    toy: {
      resize: {
        detail: "800x600"
      }
    }
  },

  storage: {
    S3: {
      key: process.env.AWS_S3_KEY,
      secret: process.env.AWS_S3_SECRET,
      bucket: 'toystori-dev'
    }
  },

  debug: true
}
