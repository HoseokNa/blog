import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faBook } from '@fortawesome/free-solid-svg-icons'

const FooterWrapper = styled.footer`
  display: grid;
  place-items: center;
  margin-top: auto;
  padding: 50px 0;
  font-size: 15px;
  text-align: center;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`
const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 8px;
`

const Footer: FunctionComponent = function () {
  return (
    <FooterWrapper>
      Thank You for Visiting My Blog, Have a Good Day 😆
      <br />© {new Date().getFullYear()} Developer Hoseok, Powered By Gatsby.
      <IconWrapper>
        <a href="https://github.com/hoseokna" target="_blank">
          <FontAwesomeIcon icon={faGithub} />
        </a>
        <a
          href="https://til-hoseok.notion.site/TIL-f69a873e19b545f8a9c39b99331d7e0c"
          target="_blank"
        >
          <FontAwesomeIcon icon={faBook} />
        </a>
      </IconWrapper>
    </FooterWrapper>
  )
}

export default Footer
