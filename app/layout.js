import './globals.css'

export const metadata = {
  title: "Naja Store Admin",
  description: "Manajemen kartu NFC digital Naja Store"
};

export default function RootLayout({children}) {
  return <html lang="id"><body>{children}</body></html>;
}