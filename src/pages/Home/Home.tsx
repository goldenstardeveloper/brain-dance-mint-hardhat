import { useEffect, useState } from 'react'
import { BrainDance, connectToWallet } from 'utils/web3_api'
import { NotificationManager } from 'components/Notification'
import Loader from 'components/Loader'

const wnd = window as any

interface Props {}

const Home = (props: Props) => {
  const [metamaskAccount, setMetamaskAccount] = useState('')
  const [price, setPrice] = useState(0)
  const [loading, setLoading] = useState(false)
  const [web3, setWeb3] = useState<any>(null)
  const [contract, setContract] = useState<BrainDance>(new BrainDance())

  const connectMetamask = async (e: any) => {
    const connectRes = await connectToWallet()
    console.log(connectRes)
    if (connectRes) {
      setWeb3(connectRes.web3)
      setContract(connectRes.contract)
      const account = wnd.ethereum.selectedAddress
      setMetamaskAccount(account)

      connectRes.contract.nativeContract.MINT_PRICE().call().then((res: any) => setPrice(res))
      console.log("Connected ...")
      console.log("Connected Address: ", account)
    }
  }

  useEffect(() => {
    connectMetamask(null)
  }, [])

  useEffect(() => {
    // NotificationManager.success('Success message', 'Title here')
    if (contract?.nativeContract) {
      contract.nativeContract.events.MintedNewNFT({}, (error: any, event: any) => {
        console.log('event: ', error, event)
        if (error) {
          return
        }
        
        const msg = `Token ${event.returnValues} minted. ${event.remainCount} token${event.remainCount <= 1 ? '' : 's'} are available`
        NotificationManager.info(msg, 'Minted new NFT')
      })
    }
  }, [contract])


  const handleMint = () => {
    setLoading(true)
    contract.mintNFT(metamaskAccount, price).on('transactionHash', function(hash: any) {
    })
    .on('receipt', function(receipt: any) {
      console.log(receipt)
      setLoading(false)
    })
    .on('confirmation', function(confirmationNumber: any, receipt: any) {
    })
    .on('error', console.error); // If a out of gas error, the second parameter is the receipt.
  }

  return (
    <div className='home-page'>
      {loading && <Loader />}
      <button type='button' onClick={handleMint}>Mint</button>
    </div>
  )
}

export default Home
