<?php

require_once("ConnectionService.php");
require_once("ServerStatus.php");
require_once("AccessGoogleServiceCalls.php");

class UserServices extends ServerStatus
{
    function Connection()
    {
        $getConnService = new GetConnectionService();
        $conn = $getConnService -> getConnection();
        return $conn;
    }

    function GetMovies()
    {
        try
        {
            $conn = $this->Connection();

            $sql = "SELECT * from mmplayerdb.mmplayermovies";
            $res_data = $conn->prepare($sql);
            $res_data->execute();

            // set the resulting array to associative
            $_response = $res_data->setFetchMode(PDO::FETCH_ASSOC);
            $response_ = $res_data->fetchAll();

//             "id" = $response[0]['id'];
//                "mName" = $response[0]['movieName'];
//                "mId" = $response[0]['movieId'];
//                "noOfSongs" = $response[0]['noOfSongs'];

            $movies_data = $response_;
            $response = array("message"=>"Service is successful",
                             "code"=>"1",
                              "movie_details"=>$movies_data
                             );
            $conn = null;
            return $response;
//            $conn->close();
        }
        catch(PDOException $e)
        {
            $movies_data = array();
                $response = array("message"=>"Movies list are empty",
                             "code"=>"0",
                            "movie_details"=>$movies_data
                             );
                return $response;
            //echo "Connection failed: " . $e->getMessage();
        }
    }

    function GetSongs($data)
    {
        try
        {
            $movieId = $data['movieId'];
            $conn = $this->Connection();
            $sql = "SELECT * from mmplayerdb.mmplayersongs WHERE movieId="."\"".$movieId."\"";
            $res_data = $conn->prepare($sql);
            $res_data->execute();
            $_response = $res_data->setFetchMode(PDO::FETCH_ASSOC);
            $response = $res_data->fetchAll();
            $response = array(
                    "message"=>"Login is successful",
                    "code"=>"1",
                    "SongDetails"=>$response
                );
                return $response;
        }
        catch(PDOException $e)
        {
          // echo 'Exception -> ';
          //   var_dump($e->getMessage());
            $user_data = array();
            $response = array("message"=>"Songs cannot be retrived.".$e->getMessage(),
                             "code"=>"0",
                              "UserDetails"=>""
                             );
            return $response;
            //echo "Connection failed: " . $e->getMessage();
        }
    }

    function GetLocalImages($data)
    {
        try
        {
            $localURL = $data['localURL'];
            $files = scandir($localURL);
            $result = array();
            // $files2 = scandir($dir, 1); //To get files in reverse order
            //$scanned_directory = array_diff(scandir($dir), array('..', '.'));//this removes  ".", ".." from the directory 
            foreach ($files as $key => $value)
            { 
                if (!in_array($value,array(".","..")))
                {
                    if (is_dir($localURL . DIRECTORY_SEPARATOR . $value))
                    {
                        $result[$value] = dirToArray($localURL . DIRECTORY_SEPARATOR . $value);
                    }
                    else
                    {
                        $result[] = $value;
                    }
                }
            } 
            $response = array(
                    "message"=>"Login is successful",
                    "code"=>"1",
                    "all_local_files"=>$result
                );
                return $response;
        }
        catch(PDOException $e)
        {
          // echo 'Exception -> ';
          //   var_dump($e->getMessage());
            $user_data = array();
            $response = array("message"=>"Songs cannot be retrived.".$e->getMessage(),
                             "code"=>"0",
                              "UserDetails"=>""
                             );
            return $response;
            //echo "Connection failed: " . $e->getMessage();
        }
    }

    function GetImagesFromDrive($data)
    {
        try
        {
            $url = $data['url'];//"https://script.google.com/macros/s/AKfycbx-jmj_70IEWRP3t5Z2QFSIkWakhYbTYvTMM2uTCCIE3ZXx0loS/exec";            
            $method = $data['access_method'];
            $Headers = $data['headers'];
            $parameters = $data['parameters'];
            if(!isset($url))
            {
                //$url = "https://script.google.com/macros/s/AKfycbx-jmj_70IEWRP3t5Z2QFSIkWakhYbTYvTMM2uTCCIE3ZXx0loS/exec";
            }
            
            $externalMethodService = new AccessGoogleServices();
            $response = $externalMethodService -> AccessGoogleServiceCall($url, $method, $parameters, $Headers);
            return $response;
        }
        catch(PDOException $e)
        {

        }
    }

    function FaultMethod($data)
    {

    }

}

?>
