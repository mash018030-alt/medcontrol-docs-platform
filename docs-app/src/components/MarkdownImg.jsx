import { publicAssetUrl } from '../utils/publicAssetUrl'

/** img в react-markdown: корректные URL при деплое на подпуть (GitHub Pages). */
export default function MarkdownImg({ src, ...props }) {
  return <img src={publicAssetUrl(src)} {...props} />
}
