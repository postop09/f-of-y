// help: 명령어 목록
import { COMMANDS } from '../model/commands'
import './commandList.css'

export const HelpList = () => (
  <div className="ex-list">
    <dl>
      {COMMANDS.map((c) => (
        <div key={c.name}>
          <dt>{c.name}</dt>
          <dd className="dim">{c.desc}</dd>
        </div>
      ))}
    </dl>
    <p className="dim"># 이력서에 대해 자유롭게 질문해보세요.</p>
  </div>
)
