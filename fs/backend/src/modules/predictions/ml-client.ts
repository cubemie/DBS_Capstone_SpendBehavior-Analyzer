import { env } from '../../config.ts'
import { AppException } from '../../exception.ts'
import {
  mlPredictionResponseSchema,
  type MlPredictionResponseDto,
} from './prediction-schema.ts'

type MlErrorBody = {
  detail?: unknown
}

async function parseErrorBody(response: Response): Promise<string | undefined> {
  const body: unknown = await response.json().catch(() => undefined)
  const parsed = zodMlErrorBody(body)

  if (typeof parsed?.detail === 'string') {
    return parsed.detail
  }

  return undefined
}

function zodMlErrorBody(value: unknown): MlErrorBody | undefined {
  if (typeof value === 'object' && value !== null && 'detail' in value) {
    return value
  }

  return undefined
}

function createMlUrl(path: string): string {
  return new URL(path, env.ML_SERVICE_URL).toString()
}

export const mlClient = {
  async predict(features: readonly number[]): Promise<MlPredictionResponseDto> {
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      controller.abort()
    }, env.ML_REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(createMlUrl('/predict'), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ features }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const detail = await parseErrorBody(response)
        throw new AppException(
          detail ?? 'Layanan ML tidak tersedia',
          response.status === 400 ? 422 : 503,
        )
      }

      const body: unknown = await response.json()

      return mlPredictionResponseSchema.parse(body)
    } catch (error) {
      if (error instanceof AppException) {
        throw error
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new AppException('Layanan ML melewati batas waktu', 503)
      }

      throw new AppException('Layanan ML tidak tersedia', 503)
    } finally {
      clearTimeout(timeout)
    }
  },
}
