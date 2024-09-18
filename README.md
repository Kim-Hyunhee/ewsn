# **동서남북**  
> **정치 진영에 따라 게시글과 댓글을 작성할 수 있는 커뮤니티 플랫폼 서버를 구축하여 사용자가 자신의 정치적 입장을 기반으로 소통하는 프로젝트**

---

## **목차**
1. [실행 환경](#1-실행-환경)  
   1-1. [로컬 실행](#1-1-로컬-실행)  
   1-2. [환경 변수](#1-2-환경-변수)  
2. [기술 스택](#2-기술-스택)  
3. [디렉토리 구조](#3-디렉토리-구조)  
4. [기능 구현](#4-기능-구현)  
   4-1. [회원가입](#4-1-회원가입)   
   4-2. [로그인](#4-2-로그인)  
   4-3. [비밀번호 찾기](#4-3-비밀번호-찾기)  
   4-4. [게시글 CRUD](#4-4-게시글-crud)  
   4-5. [댓글 CRUD](#4-5-댓글-crud)  
   4-6. [게시글 및 댓글 좋아요/신고](#4-6-게시글-및-댓글-좋아요신고)  
   4-7. [광고 및 관리자 기능](#4-7-광고-및-관리자-기능)  

---

## **1. 실행 환경**
### **1-2. 환경 변수**  
- 아래 항목들이 `.env` 파일에 반드시 존재해야 합니다:
  - `DATABASE_URL`: 데이터베이스 연결 URL
  - `JWT_SECRET_KEY`: JWT 토큰 서명에 사용될 비밀 키

---

### 기술 스택
<img src="https://img.shields.io/badge/TypeScript-version 5-3178C6">&nbsp;
<img src="https://img.shields.io/badge/Nest.js-version 10-E0234E">&nbsp;
<img src="https://img.shields.io/badge/TypeORM-version 0.3-fcad03">&nbsp;
<img src="https://img.shields.io/badge/MySQL-version 8-00758F">&nbsp;
<img src="https://img.shields.io/badge/Prisma-4.0-2D3748">&nbsp;

</br>

---

## 디렉토리 구조

<details>
<summary><strong>디렉토리 구조</strong></summary>
<div markdown="1">
 
```bash
─prisma
├─src
│  ├─constants
│  ├─decorators
│  ├─helper
│  ├─middle-ware
│  └─module
│      ├─admin
│      ├─advertisement
│      ├─auth
│      ├─category
│      ├─flag
│      ├─mailgun
│      ├─political-orientation
│      ├─posting
│      ├─prisma
│      ├─reply
│      ├─report
│      ├─upload
│      ├─user
│      └─verification-code
└─test
```
</div>
</details>

</br>

## **ERD**
![ERD 이미지](https://github.com/user-attachments/assets/e893c9f2-93d5-4b40-b0ea-b4687b1bee7a)

</br>

</br>

## 기능구현
### **4-1. 회원가입** 
* 회원 가입시 이메일 인증 코드를 보냅니다.
* 인증 코드 확인 후 중복되는 닉네임 생성을 방지하기 위해 닉네임도 확인 합니다.
* 정치 진영을 선택합니다.
  
### **4-2. 로그인** 
* 로그인 성공 시 JWT 토큰을 생성합니다.

### **4-3. 비밀번호 찾기**
* 사용자가 비밀번호를 잊어버렸을 경우 회원 가입 시 사용한 이메일로 인증코드를 보냅니다.
* 인증 코드 확인 후 비밀번호를 변경합니다.

### **4-4. 게시글 CRUD**
* 로그인 후 게시글 작성, 수정, 삭제 기능 구현
* 카테고리, 페이지 수, 키워드, 검색 날짜 검색 기능 구현

### **4-5. 댓글 CRUD**
* 로그인 후 게시글에 댓글 등록, 수정, 삭제 기능 구현

### **4-6. 게시글 및 댓글 좋아요/신고**
* 게시글 및 댓글에 좋아요, 싫어요 기능 구현 (중복 시 취소)

### **4-7. 광고 및 관리자 기능**
* 광고 CRUD 기능 구현 (등록, 수정, 삭제)
* 관리자 로그인 기능 (JWT 토큰 발급)
* 신고된 게시글 및 댓글 관리 기능
* 사용자 이용 정지 기능
* 집회 시 필요 물품 신청서 확인 기능
* 대시보드(이용자 수, 한 주의 게시글 개수, 한 주의 댓글 개수, 한 주의 이용자 수) 기능

 ---
 
 ## **Swagger 문서**
API 명세는 Swagger를 통해 확인할 수 있습니다. 아래 링크를 클릭하여 Swagger 문서로 이동하세요.

[Swagger 문서 보러 가기](https://github.com/user-attachments/assets/d252816a-68b6-4f10-a368-597e6c476605)

---
