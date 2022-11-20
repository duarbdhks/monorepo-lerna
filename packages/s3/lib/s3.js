'use strict'
const { retryAPI } = require('@duarbdhks/request')
const {
  S3Client,
  GetObjectCommand,
  GetObjectRequest,
  GetObjectOutput,
  DeleteObjectsRequest,
  DeleteObjectsOutput,
  DeleteObjectsCommand,
  HeadObjectCommand,
  HeadObjectRequest,
  HeadObjectOutput,
} = require('@aws-sdk/client-s3')

exports.init = async () => {
  const content = 'Hello from request2222'
  const result = await retryAPI({
    url: `https://www.flitto.com/api/1.2/util/detect/text?content=${content}`,
    method: 'GET'
  })
  console.log(result, 'result init duarbdhks')
  return 'Hello from s3'
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
   * S3 에서 파일들을 삭제합니다. S3 API deleteObjects 의 파라미터를 그대로 사용해도 됩니다
   * @param {DeleteObjectsRequest} options
   * @param {Array} options.s3_path list or string
   * @return {Promise<DeleteObjectsOutput>}
   */
  deleteObjects(options) {
    const params = {
      ...options,
      Bucket: options.Bucket ?? this.bucket,
      Delete: undefined
    }

    let s3Path
    if (!params.Delete && options.s3_path) {
      if (typeof options.s3_path === 'string') s3Path = [options.s3_path]
      else if (Array.isArray(options.s3_path)) s3Path = options.s3_path
      else throw new Error('s3_path should be a string or array!')

      params.Delete = { Objects: s3Path.map(Key => ({ Key: S3.#ltrimSlash(Key) })) }
    }

    if (!params.Delete.Objects.length) return {}

    S3.#removeAdditionalOptions(params)
    return this.s3.send(new DeleteObjectsCommand(params))
  }

  /**
   * S3 API headObject
   * @param {HeadObjectRequest} options
   * @param {string} options.s3_path = options.Key 정보를 얻어올 Key
   * @return {HeadObjectOutput}
   */
  headObject(options) {
    const params = { ...options, Bucket: options.Bucket ?? this.bucket, Key: options.Key ?? options.s3_path }
    S3.#removeAdditionalOptions(params)
    return this.s3.send(new HeadObjectCommand(params))
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

  static #getTempFilename(localPath) {
    const ms = new Date().getTime().toString().substring(8)
    const rd = Math.random().toString()
    const rd1 = rd.substring(2, 5)
    const rd2 = rd.substring(5, 8)
    const idx = localPath ? localPath.lastIndexOf('.') : -1
    const ext = idx >= 0 ? localPath.substring(idx) : ''

    return `${rd1}${ms}${rd2}${ext}`
  }
}

exports.S3 = S3
