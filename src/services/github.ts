export type Asset = { name: string; browser_download_url: string }
export const getReleases = async (request: Request): Promise<Response> => {
  const reqUrl = new URL(
    `https://api.github.com/repos/${GITHUB_ACCOUNT}/${GITHUB_REPO}/releases/latest`,
  )
  const headers = new Headers({
    Accept: 'application/vnd.github.preview',
    'User-Agent': request.headers.get('User-Agent') as string,
  })

  if (GITHUB_TOKEN?.length)
    headers.set('Authorization', `token ${GITHUB_TOKEN}`)

  return await fetch(reqUrl.toString(), {
    method: 'GET',
    headers,
  })
}

type Release = {
  tag_name: string
  assets: Asset[]
  body: string
  published_at: string
}

export const getLatestRelease = async (request: Request): Promise<Release> => {
  const releases = await getReleases(request)

  return (await releases.json()) as Release
}

export async function findAssetSignature(
  fileName: string,
  assets: Asset[],
): Promise<string | undefined> {
  // check in our assets if we have a file: `fileName.sig`
  // by example fileName can be: App-1.0.0.zip

  const foundSignature = assets.find(
    (asset) => asset.name.toLowerCase() === `${fileName.toLowerCase()}.sig`,
  )

  if (!foundSignature) {
    return undefined
  }

  const response = await fetch(foundSignature.browser_download_url)
  if (response.status !== 200) {
    return undefined
  }
  const signature = await response.text()
  return signature
}
