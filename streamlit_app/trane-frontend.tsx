import { useEffect, useState } from "react"
import styles from "./Ai.module.scss"
import clsx from "clsx"
import HelpAIModal from "./Container"
import { useQuery } from "src/hooks/APIHooks"
import { getAISuggestion } from "src/graphql/queries/ai"
import { useSelector } from "react-redux"
import { selectBuildingId } from "src/redux/slicers/buildingSummarySlice"

const HelpAIButton = ({theme}) => {
  const [text, setText] = useState("")
  const [variation, setVariation] = useState("generic")
  const [openState, setOpenState] = useState(false)
  const [messages, setMessages] = useState(
    [
      {actor: "ai", message: "Trane Digital Support  -  Generic Bot", type: "generic" },
      {actor: "ai", message: "Hi! Welcome to Trane Digital Support.", type: "generic" },
      {actor: "ai", message: "Ask me a general question and I'll find the answer for you.", type: "generic" },
      {actor: "ai", message: "Trane Digital Support  -  Insightful Bot", type: "insight" },
      {actor: "ai", message: "Hi! Welcome to Trane Digital Support.", type: "insight" },
      {actor: "ai", message: "Ask me a specific question and I'll find the answer for you.", type: "insight" }
    ]
  )

  const buildingId = useSelector(selectBuildingId)

  const {
    data,
    loading,
    error,
    refetch: refetchAISuggestion,
  } = useQuery({
    query: getAISuggestion,
    disableInitialLoad: true,
    variables: { limit: 1000 },
    dataPath: "data.getAISuggestion"
  })

  useEffect(() => {
    if (data) {
      const apiRes = JSON.parse(data)
      const body = JSON.parse(apiRes?.body)
      setMessages([...messages, {actor: "ai", message: body.Answer, type: variation}])
    }
  }, [data])

  useEffect(() => {
    if (error && !data) {
      setMessages([...messages, {actor: "ai", message: "I am unable to answer that. Please try again or contact support.", type: variation}])
    }
  }, [error])


  const handleKeyPress = e => {
    if (e.key === "Enter" && e?.target?.value !== "") {
      setText("")
      setMessages([...messages, {actor: "user", message: text, type: variation}])
      refetchAISuggestion({prompt: text, type: variation, buildingId: buildingId ? buildingId : "NA"})
    }
  }

  return !openState
    ? <button
      onClick={() => setOpenState(!openState)}
      className={
      clsx(
          {[styles.darkbackground]: theme === "dark"},
          styles.aibutton,
      )}
    >
      {/* TODO: This isn't the same question mark icon */}
      <span className={`icon icon-question ${styles.helpaiicon}`}></span>
      Help
    </button>
    : <HelpAIModal theme={theme} variation={variation} setVariation={e => setVariation(e)} loading={loading} text={text} handleKeyPress={e => handleKeyPress(e)} messages={messages} setText={e => setText(e)} closeModal={e => setOpenState(false)} />
}

export default HelpAIButton