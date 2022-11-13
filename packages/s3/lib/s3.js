'use strict';
const { retryAPI } = require('@duarbdhks/request')
const {
  S3Client,
  GetObjectCommand,
  GetObjectRequest,
  GetObjectOutput,
} = require('@aws-sdk/client-s3')

exports.init = async (config) => {
  console.log(config, 'duarbdhks 111111111')
  const content = 'Hello from request'
  const result = await retryAPI({
    url: `https://www.flitto.com/api/1.2/util/detect/text?content=${content}`,
    method: 'GET'
  })
  console.log(result, 'duarbdhks 2222222')
  return "Hello from s3";
}

class S3 {
  /**
   * @param {{region: string, bucket: string, credentials: {accessKeyId: string, secretAccessKey: string}}} config
   * @param {{region: string, bucket: string, endpoint: string}} config
   * @param {{region: string, bucket: string, key: string, secret: string}} config
   * @param {{token: string, channel: string}} [config.slack]
   */
  constructor(config) {
    this.bucket = config.bucket
    this.region = config.region
    this.slack = config.slack ?? {
      token: '',
      channel: ''
    }

    if ('credentials' in config) {
      this.s3 = new S3Client({ credentials: config.credentials, region: config.region })
    } else if ('key' in config && 'secret' in config) {
      const credentials = { accessKeyId: config.key, secretAccessKey: config.secret }
      this.s3 = new S3Client({ credentials, region: config.region })
    } else if ('endpoint' in config) {
      this.s3 = new S3Client({ endpoint: config.endpoint, region: config.region })
    }
  }

  /**
   * S3 API getObject. stream 대신 Buffer를 리턴
   * @param {GetObjectRequest} options
   * @param {string} [options.s3_path] = options.Key 정보를 얻어올 Key
   * @param {boolean} [options.with_stream] = true 인 경우 stream 을 리턴
   * @return {Promise<GetObjectOutput>}
   */
  async getObject(options) {
    const params = { ...options, Bucket: options.Bucket ?? this.bucket, Key: options.Key ?? options.s3_path }

    S3.#removeAdditionalOptions(params)
    const result = await this.s3.send(new GetObjectCommand(params))
    if (options.with_stream) return result

    result.Body = await S3.#streamToBuffer(result.Body)
    return result
  }

  /**
   * @param stream
   * @return {Promise<Readable | ReadableStream | Blob>}
   */
  static #streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
      const chunks = []
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('error', reject)
      stream.on('end', () => resolve(Buffer.concat(chunks)))
    })
  }

  static #removeAdditionalOptions(params) {
    for (const key in params) {
      if (!Object.prototype.hasOwnProperty.call(params, key)) continue
      if (key[0] >= 'a' && key[0] <= 'z') delete params[key]
    }
  }
}
