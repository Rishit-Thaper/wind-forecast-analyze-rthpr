import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <span>Wind Analytics · Official data sourced from Elexon BMRS WINDFOR and FUELHH streams</span>
        <span className="footer-note">
          All timestamps normalized to UTC · Metrics calculated over matched hours only
        </span>
      </div>
    </footer>
  )
}

export default Footer
