export default function checkSessionProvider(userInfo, provider, router)
{
    if(userInfo == null)
    {
      alert("Server Error")
      return 
    }
    if(userInfo.has_provider === 0)
      router.push("/verify/" + provider)
      
    return userInfo
}