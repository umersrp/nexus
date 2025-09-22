"use client";
import { Logo } from "@/constant/imagepath";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { SocialIcon } from "react-social-icons";
import classes from "./Footer.module.css";

function Footer() {
  const { isLogin, user } = useSelector((state) => state?.authReducer);
  const isUser = user?.role == "USER";

  const thisYear = new Date().getFullYear();

  const socialLinks = [
    { url: "https://telegram.com", redirectUrl: "https://t.me/stoned" },
  ];
  return (
    <footer className={classes?.footer}>
      <Container>
        <Row className="gy-3">
          <Col md={12}>
            <div className={classes?.logoDiv}>
              <Image src={Logo} alt={"Stone Logo"} />
            </div>
          </Col>
          {isLogin && isUser && (
            <Col md={12}>
              <ul className={classes?.links}>
                <li>
                  <Link href={"/"} scroll={true}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link href={"/?about=true"} scroll={false}>
                    About
                  </Link>
                </li>
              </ul>
            </Col>
          )}
          <Col md={12}>
            <ul className={classes?.links}>
              {socialLinks?.map((e, i) => (
                <li key={i}>
                  <SocialIcon
                    target={"_blank"}
                    url={e?.url}
                    onClick={(a) => {
                      a?.preventDefault();
                      if (window) {
                        window?.open(e?.redirectUrl, "_blank");
                      }
                    }}
                  />
                </li>
              ))}
            </ul>
          </Col>
          <Col md={12}>
            <p className={classes?.copyRights}>
              &copy; {thisYear} Stoned Ltd | All rights reserved
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
