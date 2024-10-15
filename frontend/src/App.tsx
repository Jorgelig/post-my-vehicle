"use client";

import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Container,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Link,
  Grid,
} from "@mui/material";

interface PublishedAd {
  status: string;
  publicationId: string;
  publicationUrl: string;
  screenshot: string;
  message: string;
}

export default function AdPublisher() {
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedAd, setPublishedAd] = useState<PublishedAd | null>(null);
  const [error, setError] = useState("");

  const handleNewPublication = () => {
    setPrice("");
    setDescription("");
    setPublishedAd(null);
    setError("");
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setError("");

    try {
      const url = `${process.env.REACT_APP_API_BASE_URL}/api/publish-ad`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: Number(price.replace(/[^0-9.-]+/g, "")),
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al publicar el anuncio");
      }

      const data = await response.json();
      setPublishedAd(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error desconocido",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const numericValue = parseInt(value, 10);
    if (!Number.isNaN(numericValue)) {
      const formattedValue = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue / 100);
      setPrice(formattedValue);
    } else {
      setPrice("");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        {!publishedAd ? (
          <>
            <Typography variant="h4" gutterBottom>
              Publicar Anuncio
            </Typography>
            <TextField
              fullWidth
              label="Precio"
              value={price}
              onChange={handlePriceChange}
              margin="normal"
              variant="outlined"
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
            />
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              variant="outlined"
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handlePublish}
              disabled={isPublishing || !price || !description}
              sx={{ mt: 2 }}
            >
              {isPublishing ? <CircularProgress size={24} /> : "Publicar"}
            </Button>
          </>
        ) : (
          <>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  ¡Anuncio Publicado Exitosamente!
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>ID de Publicación:</strong>{" "}
                      {publishedAd.publicationId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>URL de Publicación:</strong>{" "}
                      <Link
                        href={publishedAd.publicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {publishedAd.publicationUrl}
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
              <CardMedia
                component="img"
                image={`data:image/png;base64,${publishedAd.screenshot}`}
                alt="Screenshot del anuncio"
              />
            </Card>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleNewPublication}
              sx={{ mt: 3 }}
            >
              Publicar Nuevo Anuncio
            </Button>
          </>
        )}
      </Paper>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        message={error}
      />
    </Container>
  );
}
