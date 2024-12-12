import { useEffect, useState } from "react"
import axios from 'axios'

function SignUp({onSignUpComplete, onBack}) {

  let [isValidID, setIsValidID] = useState(false)
  let [isValidPW, setIsValidPW] = useState(false)
  let [isValidName, setIsValidName] = useState(false)
  let [isValidAge, setIsValidAge] = useState(false)

  let [userID, setUserID] = useState("")
  let [userPW, setUserPW] = useState("")
  let [userPW_Temp, setUserPW_Temp] = useState("")
  let [userName, setUserName] = useState("")
  let [userAge, setUserAge] = useState("")

  let [checkID, setCheckID] = useState("")
  let [checkPW, setCheckPW] = useState("")
  let [checkName, setCheckName] = useState("")
  let [checkAge, setCheckAge] = useState("")

  function InitializeAllState() {
    setUserID("")
    setUserPW("")
    setUserPW_Temp("")
    setUserName("")
    setUserAge("")
    setCheckID("")
    setCheckPW("")
    setCheckName("")
    setCheckAge("")
    setIsValidID(false)
    setIsValidPW(false)
    setIsValidName(false)
    setIsValidAge(false)
  }

  function IDlogic() {
    if(!userID.length) {
      setCheckID("ID 입력 칸이 비어 있습니다")
      setIsValidID(false)
    } else {
      axios.get("http://localhost:8080/idcheck/" + userID)
          .then((res) => {
            if(res.data.ok) {
              setCheckID("사용 가능한 ID입니다")
              setIsValidID(true)
            } else {
              setCheckID("이미 존재하는 ID입니다")
              setIsValidID(false)
            }
          })
    }
  }

  function PWlogic() {
    if(!userPW.length || !userPW_Temp.length) {
      setCheckPW("비밀번호 입력 칸이 비어 있습니다")
      setIsValidPW(false)
    } else if(userPW !== userPW_Temp) {
      setCheckPW("비밀번호가 일치하지 않습니다")
      setIsValidPW(false)
    } else {
      setCheckPW("비밀번호가 일치합니다")
      setIsValidPW(true)
    }
  }

  useEffect(() => {
    if(!userName.length) {
      setCheckName("이름 입력 칸이 비어 있습니다")
      setIsValidName(false)
    } else if(userName.length < 3) {
      setCheckName("3자리 이상 입력해 주세요")
      setIsValidName(false)
    } else {
      setCheckName("적절한 이름입니다")
      setIsValidName(true)
    }
  }, [userName])

  useEffect(() => {
    if (!userAge.length) {
      setCheckAge("나이 입력 칸이 비어 있습니다")
      setIsValidAge(false)
    } else if (userAge >= 20 && userAge < 130) {
      setCheckAge("적절한 나이입니다")
      setIsValidAge(true)
    } else {
      setCheckAge("20세 이상, 130세 미만의 나이를 입력해 주세요")
      setIsValidAge(false)
    }
  }, [userAge])

  function AllowSignUp() {
    IDlogic()
    PWlogic()

    if (isValidID && isValidPW && isValidName && isValidAge) {
      axios.get("http://localhost:8080/signup/" + userID + "/" + userPW + "/" + userName + "/" + userAge)
        .then(() => {
          InitializeAllState()
          if (onSignUpComplete) {
            onSignUpComplete()
          }
        })
        .catch(() => {
          console.log("회원가입 중 오류 발생")
        })
    } else {
      console.log("가입 실패")
    }
  }

  return (
    <div className="App" style={pageStyles.globalStyle}>
      <h2>회원가입</h2>

      <label>ID</label>
      <input 
      style={pageStyles.inputBoxStyle} 
      onChange={(e) => setUserID(e.target.value)}
      value={userID}
      />
      <button style={pageStyles.btnStyle} onClick={IDlogic}>중복체크</button>

      <label style={pageStyles.lblStatCheckStyle}>{checkID}</label>

      <label>비밀번호</label>
      <input 
      style={pageStyles.inputBoxStyle} 
      onChange={(e) => setUserPW(e.target.value)}
      value={userPW}
      />
      <label>비밀번호 확인</label>
      <input 
      style={pageStyles.inputBoxStyle} 
      onChange={(e) => setUserPW_Temp(e.target.value)}
      value={userPW_Temp}
      />
      <button style={pageStyles.btnStyle} onClick={PWlogic}>비밀번호 확인</button>

      <label style={pageStyles.lblStatCheckStyle}>{checkPW}</label>

      <label>이름</label>
      <input 
      style={pageStyles.inputBoxStyle} 
      onChange={(e) => setUserName(e.target.value)}
      value={userName}
      />
      <label style={pageStyles.lblStatCheckStyle}>{checkName}</label>

      <label>나이</label>
      <input 
      style={pageStyles.inputBoxStyle} 
      onChange={(e) => setUserAge(e.target.value)}
      value={userAge}
      />
      <label style={pageStyles.lblStatCheckStyle}>{checkAge}</label>

      <button style={pageStyles.btnStyle} onClick={AllowSignUp}>회원가입</button>
      <button style={pageStyles.btnStyle} onClick={onBack}>뒤로</button>
    </div>
  )
}

const pageStyles = {
  globalStyle: {
    width: '400px',
    margin: '0 auto',
    padding: '30px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif'
  },
  btnStyle: {
    width: '60%',
    padding: '10px',
    backgroundColor: '#ccc',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    marginBottom: '5px',
    fontSize: '16px'
  },
  lblStatCheckStyle: {
    display: 'block',
    marginTop: '5px',
    marginBottom: '10px'
  },
  inputBoxStyle: {
    width: '100%',
    padding: '8px',
    marginTop: '5px',
    marginBottom: '5px',
    boxSizing: 'border-box'
  }
}

export default SignUp
